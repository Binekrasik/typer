import {
    type ActionId,
    actionDefinitions,
    isActionId,
    type SettingDefinition,
    settingDefinitions,
    type SettingId,
    type SettingValues,
} from '../definitions.ts'
import { SettingsManager } from '../../managers/SettingsManager.ts'
import { matchRanges } from '../search.ts'
import { combosEqual, comboFromEvent, formatCombo, isModifierCode, type KeyCombo, typesCharacter } from '../../utils/keyCombos.ts'
import { sounds } from '../../audio/sounds.ts'

export type EntryState = 'idle' | 'capturing' | 'editing' | 'confirming'

export interface EntryRowContext {
    settingsManager: SettingsManager
    runAction: (id: ActionId) => void
    // a value changed because of something done in the panel
    onAdjust: (id: SettingId) => void
    onStateChange: (row: SettingsEntryRow) => void
    setStatus: (message: string | null) => void
}

const keybindIds = (Object.keys(settingDefinitions) as Array<SettingId>)
    .filter(id => settingDefinitions[id].type === 'keybind') as Array<SettingId & `keybinds.${string}`>

// an unconfirmed action stops asking after a while
const CONFIRM_TIMEOUT = 3000

// tapping esc cancels capturing, holding it this long binds esc instead
const ESCAPE_HOLD_TIME = 600

// how long a grabbed range bar stays popped before it settles into its dragged look
const RANGE_GRAB_TIME = 100

// a tick for every change in a text field, lower when deleting and wobbling a bit so fast typing doesn't sound mechanical
export const playInputTick = (event: Event) => {
    const deleting = event instanceof InputEvent && event.inputType.startsWith('delete')
    sounds.tick.play((deleting ? .85 : 1) + (Math.random() - .5) * .08)
}

const element = <Tag extends keyof HTMLElementTagNameMap>(tag: Tag, className?: string, text?: string) => {
    const created = document.createElement(tag)
    if (className) created.className = className
    if (text !== undefined) created.textContent = text

    return created
}

// counter-skewed text inside a skewed box
const skewedBox = (className: string) => {
    const box = element('div', className)
    const text = element('span')
    box.append(text)

    return { box, text }
}

/**
 * A row in the settings tree that shows and edits one setting or runs one action.
 */
export class SettingsEntryRow {
    readonly id: SettingId | ActionId
    readonly label: string
    readonly searchText: string
    readonly element: HTMLDivElement

    #context: EntryRowContext
    #state: EntryState = 'idle'
    #labelElement: HTMLSpanElement
    #valueElement: HTMLDivElement
    #renderedValue: unknown = undefined
    #confirmTimeout = -1
    #escapeHold = -1
    // a dragged range lights up instead of popping on every step
    #dragging = false
    #grabTimeout = -1

    // filled by the control builders, only the ones of this row's type are set
    #selectValue: HTMLSpanElement | null = null
    #rangeFill: HTMLDivElement | null = null
    #rangeValue: HTMLSpanElement | null = null
    #boxText: HTMLSpanElement | null = null
    #input: HTMLInputElement | null = null

    constructor(id: SettingId | ActionId, categoryLabel: string, context: EntryRowContext) {
        this.id = id
        this.#context = context

        const definition = this.definition()
        this.label = definition.label
        this.searchText = [categoryLabel, definition.label, ...(definition.keywords ?? [])].join(' ')

        this.element = element('div', 'settingsRow entryRow')
        this.element.id = `settingsEntry-${id.replace('.', '-')}`
        this.element.setAttribute('role', 'treeitem')
        this.element.setAttribute('data-type', definition.type)

        this.#labelElement = element('span', 'rowLabel', definition.label)
        this.#valueElement = element('div', 'rowValue')
        this.element.append(this.#labelElement, element('span', 'rowModified'), this.#valueElement)

        this.buildControl()
        this.render()
    }

    private definition = () => isActionId(this.id) ? actionDefinitions[this.id] : settingDefinitions[this.id]
    private settingId = () => isActionId(this.id) ? null : this.id
    private settingDefinition = (): SettingDefinition | null => isActionId(this.id) ? null : settingDefinitions[this.id]

    get state() {
        return this.#state
    }

    private setState(state: EntryState) {
        this.#state = state
        this.render()
        this.#context.onStateChange(this)
    }

    // select, range and toggle rows change with the left and right arrows
    get adjustable() {
        const type = this.definition().type
        return type === 'select' || type === 'range' || type === 'toggle'
    }

    // --- - - - - - - - ---
    //       BUILDING
    // --- - - - - - - - ---

    private buildControl() {
        const definition = this.definition()

        switch (definition.type) {
            case 'select': {
                const control = element('div', 'selectControl')
                const previous = element('span', 'selectArrow', '<')
                const next = element('span', 'selectArrow', '>')
                this.#selectValue = element('span', 'selectValue')

                previous.addEventListener('click', () => this.decrease())
                next.addEventListener('click', () => this.increase())
                this.#selectValue.addEventListener('click', () => this.increase())

                control.setAttribute('data-single', `${definition.options.length < 2}`)
                control.append(previous, this.#selectValue, next)
                this.#valueElement.append(control)
                break
            }

            case 'range': {
                const control = element('div', 'rangeControl')
                const bar = element('div', 'rangeBar')
                this.#rangeFill = element('div', 'rangeFill')
                this.#rangeValue = element('span', 'rangeValue')

                const setFromPointer = (event: PointerEvent) => {
                    // the skew widens the bounds past the track, measuring from the middle keeps the ends where they look
                    const bounds = bar.getBoundingClientRect()
                    const ratio = Math.min(1, Math.max(0, .5 + (event.clientX - bounds.left - bounds.width / 2) / bar.offsetWidth))
                    this.commit(definition.min + ratio * (definition.max - definition.min))
                }

                bar.addEventListener('pointerdown', event => {
                    bar.setPointerCapture(event.pointerId)
                    this.#dragging = true
                    control.setAttribute('data-dragging', 'true')
                    control.setAttribute('data-grabbed', 'true')

                    clearTimeout(this.#grabTimeout)
                    this.#grabTimeout = setTimeout(() => control.removeAttribute('data-grabbed'), RANGE_GRAB_TIME)
                    setFromPointer(event)
                })
                bar.addEventListener('pointermove', event => {
                    if (bar.hasPointerCapture(event.pointerId)) setFromPointer(event)
                })
                bar.addEventListener('lostpointercapture', () => {
                    this.#dragging = false
                    clearTimeout(this.#grabTimeout)
                    control.removeAttribute('data-dragging')
                    control.removeAttribute('data-grabbed')
                })

                bar.append(this.#rangeFill)
                control.append(bar, this.#rangeValue)
                this.#valueElement.append(control)
                break
            }

            case 'toggle':
            case 'keybind':
            case 'action': {
                const { box, text } = skewedBox(`${definition.type}Control`)
                this.#boxText = text

                box.addEventListener('click', () => this.activate())
                this.#valueElement.append(box)
                break
            }

            case 'text': {
                const control = element('div', 'textControl')
                this.#input = element('input')
                this.#input.type = 'text'
                this.#input.maxLength = definition.maxLength
                this.#input.placeholder = definition.placeholder
                this.#input.spellcheck = false
                this.#input.autocomplete = 'off'
                this.#input.tabIndex = -1
                this.#input.setAttribute('aria-label', definition.label)

                this.#input.addEventListener('focus', () => {
                    if (this.#state !== 'editing') {
                        sounds.interact.play()
                        this.setState('editing')
                    }
                })
                this.#input.addEventListener('input', playInputTick)
                this.#input.addEventListener('blur', () => {
                    if (this.#state === 'editing') this.finishEditing(true)
                })

                control.append(this.#input)
                this.#valueElement.append(control)
                break
            }
        }
    }

    // --- - - - - - - - ---
    //       RENDERING
    // --- - - - - - - - ---

    render() {
        const definition = this.definition()
        const id = this.settingId()
        const value = id ? this.#context.settingsManager.get(id) : null

        this.element.setAttribute('data-modified', `${id !== null && !this.#context.settingsManager.isDefault(id)}`)
        this.element.setAttribute('data-state', this.#state)

        switch (definition.type) {
            case 'select':
                this.#selectValue!.textContent = definition.options.find(option => option.value === value)?.label ?? `${value}`
                break

            case 'range': {
                const number = value as number
                this.#rangeFill!.style.width = `${(number - definition.min) / (definition.max - definition.min) * 100}%`
                this.#rangeValue!.textContent = definition.format(number)
                break
            }

            case 'toggle':
                this.#boxText!.textContent = value ? 'on' : 'off'
                this.#boxText!.parentElement!.setAttribute('data-on', `${value}`)
                break

            case 'keybind': {
                const holding = this.#escapeHold !== -1
                const box = this.#boxText!.parentElement!

                this.#boxText!.textContent = holding ? 'hold to bind'
                    : this.#state === 'capturing' ? 'press keys'
                    : formatCombo(value as KeyCombo | null)

                box.setAttribute('data-unbound', `${value === null}`)
                box.setAttribute('data-holding', `${holding}`)
                box.style.setProperty('--holdTime', `${ESCAPE_HOLD_TIME}ms`)
                break
            }

            case 'text':
                if (this.#state !== 'editing') this.#input!.value = value as string
                break

            case 'action':
                this.#boxText!.textContent = this.#state === 'confirming' ? 'press again' : definition.button
                break
        }

        // the value pops when it changes, but not on the first render or while it's dragged
        if (this.#renderedValue !== undefined && !this.#dragging && !SettingsManager.valuesEqual(this.#renderedValue, value)) {
            this.#valueElement.removeAttribute('data-changed')
            void this.#valueElement.offsetWidth
            this.#valueElement.setAttribute('data-changed', 'true')
        }

        this.#renderedValue = value
    }

    highlight(query: string) {
        const ranges = matchRanges(this.label, query)
        let position = 0

        this.#labelElement.replaceChildren()

        for (const [start, end] of ranges) {
            this.#labelElement.append(this.label.slice(position, start), element('mark', undefined, this.label.slice(start, end)))
            position = end
        }

        this.#labelElement.append(this.label.slice(position))
    }

    // --- - - - - - - - ---
    //        EDITING
    // --- - - - - - - - ---

    private commit<Id extends SettingId>(value: SettingValues[Id]) {
        const id = this.settingId() as Id | null
        if (id && this.#context.settingsManager.set(id, value))
            this.#context.onAdjust(id)
    }

    private step(direction: 1 | -1) {
        const definition = this.settingDefinition()
        const id = this.settingId()
        if (!definition || !id) return

        const value = this.#context.settingsManager.get(id)

        if (definition.type === 'select') {
            const index = definition.options.findIndex(option => option.value === value)
            const count = definition.options.length
            this.commit(definition.options[(index + direction + count) % count].value)
        } else if (definition.type === 'range')
            this.commit((value as number) + definition.step * direction)
        else if (definition.type === 'toggle')
            this.commit(direction === 1)
    }

    increase = () => this.step(1)
    decrease = () => this.step(-1)

    activate() {
        const definition = this.definition()
        const id = this.settingId()

        switch (definition.type) {
            case 'select':
                this.increase()
                break

            case 'toggle':
                this.commit(!this.#context.settingsManager.get(id!))
                break

            case 'keybind':
                sounds.interact.play()
                this.setState('capturing')
                break

            case 'text':
                this.#input!.focus()
                this.#input!.select()
                break

            case 'action':
                if (this.#state === 'confirming') {
                    this.cancel()
                    sounds.select.play()
                    this.#context.runAction(this.id as ActionId)
                } else {
                    sounds.interact.play()
                    this.setState('confirming')
                    this.#confirmTimeout = setTimeout(() => this.cancel(), CONFIRM_TIMEOUT)
                }
                break
        }
    }

    resetToDefault() {
        const id = this.settingId()
        if (id && this.#context.settingsManager.reset(id))
            this.#context.onAdjust(id)
    }

    /**
     * Handles a key press while the row is capturing a keybind or being edited.
     * @returns `true` when the row used the key
     */
    handleKey(event: KeyboardEvent): boolean {
        if (this.#state === 'editing') {
            if (event.key === 'Enter' || event.key === 'Escape') {
                this.finishEditing(event.key === 'Enter')
                return true
            }

            return false
        }

        if (this.#state !== 'capturing') return false
        if (event.repeat || isModifierCode(event.code)) return true

        // pressing another key while esc is held binds that key instead
        this.stopEscapeHold()

        const combo = comboFromEvent(event)!

        if (event.code === 'Escape') {
            this.#escapeHold = setTimeout(() => this.bind(combo), ESCAPE_HOLD_TIME)
            this.render()
            return true
        }

        if (typesCharacter(combo)) {
            sounds.interact.play(.7)
            this.#context.setStatus(`${formatCombo(combo)} types in the test, hold ctrl or alt with it`)
            return true
        }

        this.bind(combo)
        return true
    }

    /**
     * Handles a key being released while the row is capturing a keybind.
     * @returns `true` when the row used the key
     */
    handleKeyUp(event: KeyboardEvent): boolean {
        if (this.#state !== 'capturing' || event.code !== 'Escape' || this.#escapeHold === -1) return false

        // esc was let go before it got bound, so it was a tap
        sounds.interact.play(.85)
        this.cancel()
        return true
    }

    private stopEscapeHold() {
        if (this.#escapeHold === -1) return

        clearTimeout(this.#escapeHold)
        this.#escapeHold = -1
        this.render()
    }

    private bind(combo: KeyCombo) {
        this.stopEscapeHold()

        // a combo can only do one thing, so whatever else used it becomes unbound
        const id = this.settingId() as SettingId & `keybinds.${string}`
        keybindIds
            .filter(other => other !== id && combosEqual(this.#context.settingsManager.get(other), combo))
            .forEach(other => this.#context.settingsManager.set(other, null))

        // binding the same combo again changes nothing, so it wouldn't make the usual sound
        if (combosEqual(this.#context.settingsManager.get(id), combo)) sounds.select.play()

        this.setState('idle')
        this.commit(combo)
    }

    private finishEditing(save: boolean) {
        if (save) this.commit(this.#input!.value)

        // leaving the input blurs it, which finishes editing only while it's still going
        this.setState('idle')
        if (document.activeElement === this.#input) this.#input!.blur()
    }

    // leaves capturing, editing or confirming, a text field keeps what was typed
    cancel() {
        clearTimeout(this.#confirmTimeout)
        this.stopEscapeHold()

        if (this.#state === 'editing') this.finishEditing(true)
        else if (this.#state !== 'idle') this.setState('idle')
    }
}

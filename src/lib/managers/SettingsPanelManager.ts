import { type ActionId, type SettingId, type SettingsCategory, settingsCategories } from '../settings/definitions.ts'
import { playInputTick, SettingsEntryRow } from '../settings/panel/SettingsEntryRow.ts'
import { matchesQuery } from '../settings/search.ts'
import type { SettingsManager } from './SettingsManager.ts'
import type { KeybindManager } from './KeybindManager.ts'
import { sounds } from '../audio/sounds.ts'
import { arrayYoink } from '../utils/arrays.ts'

type PanelEventType = 'open' | 'close' | 'adjust'

interface PanelEventListener {
    type: PanelEventType
    exec: (id?: SettingId) => void
}

export interface SettingsPanelOptions {
    canOpen: () => boolean
    actions: Record<ActionId, () => void>
}

interface CategoryNode {
    category: SettingsCategory
    element: HTMLDivElement
    row: HTMLDivElement
    entries: Array<SettingsEntryRow>
    // what the user chose, a search opens every category with a match regardless
    open: boolean
}

type TreeRow =
    | { kind: 'category', node: CategoryNode, element: HTMLDivElement }
    | { kind: 'entry', node: CategoryNode, entry: SettingsEntryRow, element: HTMLDivElement }

// the panel explains itself, only binding esc by holding it is hidden enough to need a hint
const captureHints: Array<[string, string]> = [['hold esc', 'bind esc'], ['esc', 'cancel']]

const queryElement = <Type extends Element>(parent: ParentNode, selector: string) => {
    const element = parent.querySelector(selector)
    if (!element)
        throw Error(`Couldn't find the settings panel element "${selector}".`)

    return element as Type
}

export class SettingsPanelManager {
    #settingsManager: SettingsManager
    #keybindManager: KeybindManager
    #options: SettingsPanelOptions
    #listeners: Array<PanelEventListener> = []

    #overlay: HTMLDivElement
    #panel: HTMLDivElement
    #search: HTMLInputElement
    #tree: HTMLDivElement
    #entriesElement: HTMLDivElement
    #cursor: HTMLDivElement
    #empty: HTMLParagraphElement
    #statusBar: HTMLDivElement
    #statusContent: HTMLDivElement

    #categories: Array<CategoryNode> = []
    #entries: Array<SettingsEntryRow> = []
    #rows: Array<TreeRow> = []
    #selected: TreeRow | null = null
    #isOpen = false
    #statusMessage: string | null = null

    constructor(settingsManager: SettingsManager, keybindManager: KeybindManager, options: SettingsPanelOptions) {
        this.#settingsManager = settingsManager
        this.#keybindManager = keybindManager
        this.#options = options

        this.#overlay = queryElement(document, '#settingsOverlay')
        this.#panel = queryElement(this.#overlay, '.settingsPanel')
        this.#search = queryElement(this.#overlay, '.settingsSearch input')
        this.#tree = queryElement(this.#overlay, '.settingsTree')
        this.#entriesElement = queryElement(this.#overlay, '.settingsEntries')
        this.#cursor = queryElement(this.#overlay, '.settingsCursor')
        this.#empty = queryElement(this.#overlay, '.settingsEmpty')
        this.#statusBar = queryElement(this.#overlay, '.settingsStatusBar')
        this.#statusContent = queryElement(this.#statusBar, '.settingsStatusContent')

        this.buildTree()
        this.refresh()

        this.#search.addEventListener('input', event => {
            playInputTick(event)
            this.refresh()

            // typing jumps to the best match, so enter applies to it right away
            const firstMatch = this.#search.value.trim() ? this.#rows.find(row => row.kind === 'entry') : null
            if (firstMatch) this.select(firstMatch)
        })

        this.#overlay.addEventListener('focusin', () => this.syncZone())
        this.#overlay.addEventListener('pointerdown', event => {
            if (event.target === this.#overlay) this.close()
        })

        // categories rolling out move the rows under the cursor
        new ResizeObserver(() => this.syncCursor()).observe(this.#entriesElement)
        window.addEventListener('resize', () => this.syncCursor())

        window.addEventListener('keydown', this.onKeydown, { capture: true })
        window.addEventListener('keyup', this.onKeyup, { capture: true })

        // the release of a held key never arrives once the window loses focus
        window.addEventListener('blur', () => this.#entries
            .filter(entry => entry.state === 'capturing')
            .forEach(entry => entry.cancel()))

        settingsManager.addListener({
            type: 'valuechange',
            exec: change => this.#entries.find(entry => entry.id === change.id)?.render(),
        })
    }

    // --- - - - - - - - ---
    //        EVENTS
    // --- - - - - - - - ---

    addListener = (listener: PanelEventListener) => this.#listeners.push(listener)
    removeListener = (listener: PanelEventListener) => arrayYoink(this.#listeners, listener)

    callListeners(type: PanelEventType, id?: SettingId) {
        this.#listeners
            .filter(listener => listener.type === type)
            .forEach(listener => listener.exec(id))
    }

    // --- - - - - - - - ---
    //    OPENING & CLOSING
    // --- - - - - - - - ---

    isOpen = () => this.#isOpen

    open() {
        if (this.#isOpen || !this.#options.canOpen()) return

        this.#isOpen = true
        this.#overlay.inert = false
        this.#overlay.setAttribute('data-open', 'true')

        this.#entries.forEach(entry => entry.render())
        this.#search.value = ''
        this.refresh()
        this.#search.focus()

        sounds.interact.play()
        this.callListeners('open')
    }

    close() {
        if (!this.#isOpen) return

        this.#entries.forEach(entry => entry.cancel())
        this.setStatus(null)

        this.#isOpen = false
        this.#overlay.setAttribute('data-open', 'false')
        this.#overlay.inert = true;

        (document.activeElement as HTMLElement | null)?.blur()

        sounds.interact.play(.9)
        this.callListeners('close')
    }

    toggle = () => this.#isOpen ? this.close() : this.open()

    // --- - - - - - - - ---
    //         TREE
    // --- - - - - - - - ---

    private buildTree() {
        const context = {
            settingsManager: this.#settingsManager,
            runAction: (id: ActionId) => this.#options.actions[id](),
            onAdjust: (id: SettingId) => this.callListeners('adjust', id),
            onStateChange: (entry: SettingsEntryRow) => {
                // the tree takes the keyboard back once a text field is done, the search box keeps it
                const active = document.activeElement
                if (entry.state === 'idle' && this.#isOpen && active !== this.#search && active !== this.#tree)
                    this.#tree.focus({ preventScroll: true })

                this.setStatus(null)
            },
            setStatus: (message: string | null) => this.setStatus(message),
        }

        this.#categories = settingsCategories.map(category => {
            const element = document.createElement('div')
            element.className = 'settingsCategory'

            const row = document.createElement('div')
            row.className = 'settingsRow categoryRow'
            row.id = `settingsCategory-${category.id}`
            row.setAttribute('role', 'treeitem')

            const chevron = document.createElement('span')
            chevron.className = 'chevron'

            const label = document.createElement('span')
            label.className = 'rowLabel'
            label.textContent = category.label

            const count = document.createElement('span')
            count.className = 'categoryCount'

            row.append(chevron, label, count)

            const children = document.createElement('div')
            children.className = 'categoryChildren'
            children.setAttribute('role', 'group')

            const childrenInner = document.createElement('div')
            childrenInner.className = 'categoryChildrenInner'
            children.append(childrenInner)

            const node: CategoryNode = {
                category,
                element,
                row,
                entries: category.entries.map(id => new SettingsEntryRow(id, category.label, context)),
                open: false,
            }

            node.entries.forEach(entry => {
                childrenInner.append(entry.element)
                this.#entries.push(entry)

                entry.element.addEventListener('click', () => {
                    const treeRow = this.#rows.find(row => row.kind === 'entry' && row.entry === entry)
                    if (treeRow) this.navigate(treeRow)
                })
            })

            row.addEventListener('click', () => {
                this.setCategoryOpen(node, !node.open)

                const treeRow = this.#rows.find(row => row.kind === 'category' && row.node === node)
                if (treeRow) this.select(treeRow)
            })

            element.append(row, children)
            this.#entriesElement.append(element)

            return node
        })
    }

    private setCategoryOpen(node: CategoryNode, open: boolean) {
        // a search keeps every category with a match open
        if (node.open === open || this.query()) return

        node.open = open
        sounds.interact.play(open ? 1 : .9)
        this.refresh()
    }

    private query = () => this.#search.value.trim()

    // shows the categories and entries matching the search, and lists the rows that can be selected
    private refresh() {
        const query = this.query()
        this.#rows = []

        for (const node of this.#categories) {
            const matches = node.entries.filter(entry => !query || matchesQuery(entry.searchText, query))
            const open = query ? true : node.open

            node.element.hidden = matches.length === 0
            node.element.setAttribute('data-open', `${open}`);
            (node.row.querySelector('.categoryCount') as HTMLSpanElement).textContent = `${matches.length}`
            node.row.setAttribute('aria-expanded', `${open}`)

            if (node.element.hidden) continue

            this.#rows.push({ kind: 'category', node, element: node.row })

            node.entries.forEach(entry => {
                const index = matches.indexOf(entry)

                entry.element.hidden = index === -1
                entry.element.setAttribute('data-last', `${index === matches.length - 1}`)
                entry.element.style.setProperty('--index', `${index}`)
                entry.highlight(query)

                if (open && index !== -1)
                    this.#rows.push({ kind: 'entry', node, entry, element: entry.element })
            })
        }

        this.#empty.hidden = this.#rows.length > 0;
        (this.#empty.querySelector('span') as HTMLSpanElement).textContent = query

        // the selection falls back to its category when it's collapsed or filtered out
        const selected = this.#selected
        const kept = selected
            && (this.#rows.find(row => row.element === selected.element)
                ?? this.#rows.find(row => row.kind === 'category' && row.node === selected.node))

        this.select(kept || this.#rows[0] || null, false)
    }

    // --- - - - - - - - ---
    //       SELECTION
    // --- - - - - - - - ---

    private select(row: TreeRow | null, scroll = true) {
        if (this.#selected && this.#selected.element !== row?.element) {
            this.#selected.element.setAttribute('aria-selected', 'false')
            if (this.#selected.kind === 'entry' && this.#selected.entry.state === 'confirming')
                this.#selected.entry.cancel()
        }

        this.#selected = row

        if (row) {
            row.element.setAttribute('aria-selected', 'true')
            this.#tree.setAttribute('aria-activedescendant', row.element.id)

            if (scroll) row.element.scrollIntoView({ block: 'nearest' })
        } else this.#tree.removeAttribute('aria-activedescendant')

        this.syncCursor()
    }

    // a selection the user moved ticks, a little higher going up and lower going down
    private navigate(row: TreeRow | null) {
        if (!row || row === this.#selected) return

        const from = this.#selected ? this.#rows.indexOf(this.#selected) : -1
        sounds.tick.play(this.#rows.indexOf(row) < from ? 1.06 : .94)

        this.select(row)
    }

    private moveSelection(offset: number) {
        const index = this.#selected ? this.#rows.indexOf(this.#selected) : -1
        this.navigate(this.#rows[Math.min(this.#rows.length - 1, Math.max(0, index + offset))] ?? null)
    }

    private syncCursor() {
        const row = this.#selected?.element
        this.#cursor.setAttribute('data-hidden', `${!row}`)
        if (!row) return

        const treeBounds = this.#tree.getBoundingClientRect()
        const rowBounds = row.getBoundingClientRect()

        // the panel scales up while it opens, so the measured bounds are scaled back to layout pixels
        const scale = treeBounds.width / this.#tree.offsetWidth || 1

        this.#cursor.style.top = `${(rowBounds.top - treeBounds.top) / scale + this.#tree.scrollTop}px`
        this.#cursor.style.left = `${(rowBounds.left - treeBounds.left) / scale}px`
        this.#cursor.style.width = `${rowBounds.width / scale}px`
        this.#cursor.style.height = `${rowBounds.height / scale}px`
    }

    // --- - - - - - - - ---
    //       KEYBOARD
    // --- - - - - - - - ---

    private focusTree() {
        sounds.tick.play(.94)
        this.#tree.focus({ preventScroll: true })
        if (!this.#selected) this.select(this.#rows[0] ?? null)
    }

    private focusSearch() {
        if (document.activeElement !== this.#search) sounds.tick.play(1.06)
        this.#search.focus()
    }

    // keys typed in the tree go to the search box, which makes the same tick as typing into it
    private typeIntoSearch(value: string, inputType: string) {
        this.#search.value = value
        this.#search.focus()
        this.#search.dispatchEvent(new InputEvent('input', { inputType }))
    }

    private busyEntry = () => this.#entries.find(entry => entry.state === 'capturing' || entry.state === 'editing')

    private onKeydown = (event: KeyboardEvent) => {
        if (!this.#isOpen) return

        const busy = this.busyEntry()
        if (busy) {
            if (busy.handleKey(event)) event.preventDefault()
            return
        }

        const handled = () => event.preventDefault()

        if (!event.repeat && (event.key === 'Escape' || this.#keybindManager.matchesAction(event, 'openSettings'))) {
            const confirming = this.#entries.find(entry => entry.state === 'confirming')
            if (confirming) {
                sounds.interact.play(.85)
                confirming.cancel()
            } else this.close()

            return handled()
        }

        const inSearch = document.activeElement === this.#search
        const selected = this.#selected

        if (event.key === 'Tab') {
            if (inSearch) this.focusTree()
            else this.focusSearch()

            return handled()
        }

        if (inSearch) {
            // a search already selected its first match
            if (event.key === 'ArrowDown' || event.key === 'Enter') {
                this.focusTree()
                return handled()
            }

            // everything else types into the search box
            return
        }

        switch (event.key) {
            case 'ArrowDown':
                this.moveSelection(1)
                return handled()

            case 'ArrowUp':
                if (!selected || this.#rows.indexOf(selected) <= 0) this.focusSearch()
                else this.moveSelection(-1)

                return handled()

            case 'Home':
                this.navigate(this.#rows[0] ?? null)
                return handled()

            case 'End':
                this.navigate(this.#rows[this.#rows.length - 1] ?? null)
                return handled()

            case 'ArrowRight':
                if (selected?.kind === 'category') {
                    if (selected.node.open || this.query()) this.moveSelection(1)
                    else this.setCategoryOpen(selected.node, true)
                } else if (selected?.entry.adjustable) selected.entry.increase()

                return handled()

            case 'ArrowLeft':
                if (selected?.kind === 'category') this.setCategoryOpen(selected.node, false)
                else if (selected?.entry.adjustable) selected.entry.decrease()
                else if (selected) this.navigate(this.#rows.find(row => row.kind === 'category' && row.node === selected.node) ?? null)

                return handled()

            case 'Enter':
            case ' ':
                if (selected?.kind === 'category') this.setCategoryOpen(selected.node, !selected.node.open)
                else selected?.entry.activate()

                return handled()

            case 'Delete':
                if (selected?.kind === 'entry') selected.entry.resetToDefault()
                return handled()

            case 'Backspace':
                this.typeIntoSearch(this.#search.value.slice(0, -1), 'deleteContentBackward')
                return handled()
        }

        // typing anywhere in the tree searches
        if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
            this.typeIntoSearch(this.#search.value + event.key, 'insertText')
            return handled()
        }
    }

    private onKeyup = (event: KeyboardEvent) => {
        if (this.#isOpen && this.busyEntry()?.handleKeyUp(event)) event.preventDefault()
    }

    // --- - - - - - - - ---
    //      STATUS BAR
    // --- - - - - - - - ---

    private syncZone() {
        this.#panel.setAttribute('data-zone', document.activeElement === this.#search ? 'search' : 'tree')
    }

    private setStatus(message: string | null) {
        this.#statusMessage = message
        this.renderStatus()
    }

    private renderStatus() {
        const capturing = this.#entries.some(entry => entry.state === 'capturing')
        const shown = capturing || this.#statusMessage !== null

        this.#statusBar.setAttribute('data-shown', `${shown}`)

        // a hiding bar keeps what it said until it has folded away
        if (!shown) return

        this.#statusContent.replaceChildren()

        if (this.#statusMessage) {
            const message = document.createElement('span')
            message.className = 'statusMessage'
            message.textContent = this.#statusMessage
            this.#statusContent.append(message)
        }

        for (const [keys, label] of capturing ? captureHints : []) {
            const hint = document.createElement('span')
            hint.className = 'hint'

            const key = document.createElement('span')
            key.className = 'key'

            const keyText = document.createElement('span')
            keyText.textContent = keys

            key.append(keyText)
            hint.append(key, label)
            this.#statusContent.append(hint)
        }
    }
}

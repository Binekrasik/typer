import {
    type SettingDefinition,
    settingDefinitions,
    type SettingId,
    type SettingValues,
} from '../settings/definitions.ts'
import { combosEqual, type KeyCombo } from '../utils/keyCombos.ts'
import { arrayYoink } from '../utils/arrays.ts'

export type SettingsEventType = 'valuechange'

export type SettingChange = { [Id in SettingId]: { id: Id, value: SettingValues[Id] } }[SettingId]

export interface SettingsListener {
    type: SettingsEventType
    exec: (change: SettingChange) => void
}

export type SettingsStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

const settingIds = Object.keys(settingDefinitions) as Array<SettingId>

export class SettingsManager {
    static readonly storageKey = 'typerSettings'
    // settings saved before the settings panel, they stored `{ name, value }` entries
    static readonly legacyStorageKey = 'typerSavedSettingsJsonObject'

    readonly #storage: SettingsStorage | null
    readonly #values: SettingValues
    readonly #listeners: Array<SettingsListener> = []

    constructor(storage: SettingsStorage | null = SettingsManager.defaultStorage()) {
        this.#storage = storage
        this.#values = this.loadSettings()
        this.saveCurrentSettings()
    }

    // reading localStorage throws when the browser blocks site data
    static defaultStorage(): SettingsStorage | null {
        try {
            return localStorage
        } catch {
            return null
        }
    }

    // --- - - - - - - - ---
    //        EVENTS
    // --- - - - - - - - ---

    addListener = (listener: SettingsListener) => this.#listeners.push(listener)
    removeListener = (listener: SettingsListener) => arrayYoink(this.#listeners, listener)

    emitEvent = (type: SettingsEventType, change: SettingChange) =>
        this.#listeners
            .filter(listener => listener.type === type)
            .forEach(listener => listener.exec(change))

    // --- - - - - - - - ---
    //   LOADING & SAVING
    // --- - - - - - - - ---

    static defaultValue = <Id extends SettingId>(id: Id) =>
        structuredClone(settingDefinitions[id].default) as SettingValues[Id]

    static defaultValues = () =>
        Object.fromEntries(settingIds.map(id => [id, SettingsManager.defaultValue(id)])) as unknown as SettingValues

    loadSettings(): SettingValues {
        const values = SettingsManager.defaultValues()
        const saved = { ...this.readLegacySettings(), ...this.readJson(SettingsManager.storageKey) }

        // anything saved that no longer fits its setting falls back to the default
        for (const id of settingIds) {
            const value = SettingsManager.sanitize(settingDefinitions[id], saved[id])
            if (value !== undefined)
                (values as Record<SettingId, unknown>)[id] = value
        }

        return values
    }

    private readJson(key: string): Record<string, unknown> {
        try {
            const parsed = JSON.parse(this.#storage?.getItem(key) ?? 'null')
            return parsed && typeof parsed === 'object' ? parsed : {}
        } catch {
            return {}
        }
    }

    private readLegacySettings(): Record<string, unknown> {
        const legacy = this.readJson(SettingsManager.legacyStorageKey) as { characterCount?: { value?: unknown } }

        try {
            this.#storage?.removeItem(SettingsManager.legacyStorageKey)
        } catch {
            // it's read again next time, which is harmless
        }

        return legacy.characterCount ? { 'test.length': legacy.characterCount.value } : {}
    }

    saveCurrentSettings() {
        try {
            this.#storage?.setItem(SettingsManager.storageKey, JSON.stringify(this.#values))
        } catch {
            // settings still work for this session
        }
    }

    // --- - - - - - - - ---
    //    READING & WRITING
    // --- - - - - - - - ---

    get = <Id extends SettingId>(id: Id): SettingValues[Id] => this.#values[id]

    /**
     * Stores the value if it fits the setting.
     * @returns `true` when the stored value changed
     */
    set<Id extends SettingId>(id: Id, value: SettingValues[Id]): boolean {
        const sanitized = SettingsManager.sanitize(settingDefinitions[id], value) as SettingValues[Id] | undefined
        if (sanitized === undefined || SettingsManager.valuesEqual(this.#values[id], sanitized))
            return false

        this.#values[id] = sanitized
        this.saveCurrentSettings()

        this.emitEvent('valuechange', { id, value: sanitized } as SettingChange)
        return true
    }

    reset = (id: SettingId) => this.set(id, SettingsManager.defaultValue(id))
    resetAll = () => settingIds.forEach(id => this.reset(id))

    isDefault = (id: SettingId) => SettingsManager.valuesEqual(this.#values[id], SettingsManager.defaultValue(id))

    // keybinds are the only object values
    static valuesEqual = (a: unknown, b: unknown) =>
        a === b || (typeof a === 'object' && typeof b === 'object' && combosEqual(a as KeyCombo | null, b as KeyCombo | null))

    /**
     * Fits a value to its setting.
     * @returns `undefined` when the value can't be used for the setting
     */
    static sanitize(definition: SettingDefinition, value: unknown): unknown {
        switch (definition.type) {
            case 'select':
                return definition.options.some(option => option.value === value) ? value : undefined

            case 'range': {
                if (typeof value !== 'number' || !Number.isFinite(value)) return undefined

                const steps = Math.round((value - definition.min) / definition.step)
                return Math.min(definition.max, Math.max(definition.min, definition.min + steps * definition.step))
            }

            case 'toggle':
                return typeof value === 'boolean' ? value : undefined

            case 'text':
                return typeof value === 'string' ? value.trim().slice(0, definition.maxLength) : undefined

            case 'keybind': {
                if (value === null) return null

                const combo = value as Partial<KeyCombo> | undefined
                const isCombo = typeof combo === 'object'
                    && typeof combo.code === 'string'
                    && (['ctrl', 'shift', 'alt', 'meta'] as const).every(modifier => typeof combo[modifier] === 'boolean')

                return isCombo ? { code: combo.code, ctrl: combo.ctrl, shift: combo.shift, alt: combo.alt, meta: combo.meta } : undefined
            }
        }
    }
}

import { describe, expect, test } from 'bun:test'
import { type SettingChange, SettingsManager, type SettingsStorage } from '../src/lib/managers/SettingsManager.ts'
import { keyCombo } from '../src/lib/utils/keyCombos.ts'

const memoryStorage = (initial: Record<string, unknown> = {}) => {
    const items = new Map(Object.entries(initial).map(([key, value]) => [key, JSON.stringify(value)]))
    const storage: SettingsStorage = {
        getItem: key => items.get(key) ?? null,
        setItem: (key, value) => void items.set(key, value),
        removeItem: key => void items.delete(key),
    }

    return { storage, items, saved: () => JSON.parse(items.get(SettingsManager.storageKey) ?? 'null') }
}

describe('SettingsManager', () => {
    test('starts from the defaults and saves them', () => {
        const { storage, saved } = memoryStorage()
        const settings = new SettingsManager(storage)

        expect(settings.get('test.length')).toBe(60)
        expect(settings.get('keyboard.layout')).toBe('czechQwertz')
        expect(settings.get('keybinds.openSettingsAlt')).toEqual(keyCombo('KeyP', { ctrl: true, shift: true }))
        expect(saved()['test.length']).toBe(60)
    })

    test('migrates the character count saved before the settings panel', () => {
        const { storage, items } = memoryStorage({ [SettingsManager.legacyStorageKey]: { characterCount: { name: 'character count', value: 120 } } })
        const settings = new SettingsManager(storage)

        expect(settings.get('test.length')).toBe(120)
        expect(items.has(SettingsManager.legacyStorageKey)).toBe(false)
    })

    test('drops saved values that no longer fit their setting', () => {
        const { storage } = memoryStorage({
            [SettingsManager.storageKey]: {
                'test.length': 'lots',
                'keyboard.layout': 'azerty',
                'appearance.smoothCaret': false,
                'keybinds.resetTest': { code: 'KeyR' },
                'unknown.setting': 4,
            },
        })
        const settings = new SettingsManager(storage)

        expect(settings.get('test.length')).toBe(60)
        expect(settings.get('keyboard.layout')).toBe('czechQwertz')
        expect(settings.get('appearance.smoothCaret')).toBe(false)
        expect(settings.get('keybinds.resetTest')).toEqual(keyCombo('Backspace', { ctrl: true, shift: true }))
    })

    test('survives storage that throws or holds broken json', () => {
        const throwing: SettingsStorage = {
            getItem: () => { throw Error('blocked') },
            setItem: () => { throw Error('blocked') },
            removeItem: () => { throw Error('blocked') },
        }
        expect(new SettingsManager(throwing).get('test.length')).toBe(60)

        const { storage, items } = memoryStorage()
        items.set(SettingsManager.storageKey, '{not json')
        expect(new SettingsManager(storage).get('test.length')).toBe(60)

        expect(new SettingsManager(null).get('test.length')).toBe(60)
    })

    test('clamps ranges to their bounds and steps', () => {
        const settings = new SettingsManager(memoryStorage().storage)

        settings.set('test.length', 9000)
        expect(settings.get('test.length')).toBe(500)

        settings.set('test.length', 0)
        expect(settings.get('test.length')).toBe(10)

        settings.set('audio.master', 52)
        expect(settings.get('audio.master')).toBe(50)
    })

    test('emits and saves only real changes', () => {
        const { storage, saved } = memoryStorage()
        const settings = new SettingsManager(storage)
        const changes: Array<SettingChange> = []
        settings.addListener({ type: 'valuechange', exec: change => changes.push(change) })

        expect(settings.set('test.length', 60)).toBe(false)
        expect(settings.set('keyboard.layout', 'nope')).toBe(false)
        expect(settings.set('keybinds.openSettings', keyCombo('Escape'))).toBe(false)
        expect(changes).toEqual([])

        expect(settings.set('keyboard.layout', 'dvorak')).toBe(true)
        expect(changes).toEqual([{ id: 'keyboard.layout', value: 'dvorak' }])
        expect(saved()['keyboard.layout']).toBe('dvorak')
    })

    test('trims and shortens text', () => {
        const settings = new SettingsManager(memoryStorage().storage)

        settings.set('profile.username', '   binekrasik  ')
        expect(settings.get('profile.username')).toBe('binekrasik')

        settings.set('profile.username', 'x'.repeat(100))
        expect(settings.get('profile.username')).toHaveLength(24)
    })

    test('resets one setting or all of them', () => {
        const settings = new SettingsManager(memoryStorage().storage)

        settings.set('appearance.theme', 'rose')
        settings.set('keybinds.resetTest', null)
        expect(settings.isDefault('appearance.theme')).toBe(false)

        settings.reset('appearance.theme')
        expect(settings.get('appearance.theme')).toBe('mint')

        const changes: Array<SettingChange> = []
        settings.addListener({ type: 'valuechange', exec: change => changes.push(change) })
        settings.resetAll()

        expect(changes.map(change => change.id)).toEqual(['keybinds.resetTest'])
        expect(settings.isDefault('keybinds.resetTest')).toBe(true)
    })

    test('hands out copies of default keybinds', () => {
        const first = SettingsManager.defaultValue('keybinds.openSettings')
        first!.code = 'KeyQ'

        expect(SettingsManager.defaultValue('keybinds.openSettings')!.code).toBe('Escape')
    })
})

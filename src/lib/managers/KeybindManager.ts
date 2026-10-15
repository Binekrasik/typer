import type { SettingsManager } from './SettingsManager.ts'
import type { SettingId } from '../settings/definitions.ts'
import { matchesCombo } from '../utils/keyCombos.ts'

export type KeybindAction = 'openSettings' | 'resetTest' | 'nextDifficulty' | 'previousDifficulty'

const keybindActions: Array<{ setting: SettingId & `keybinds.${string}`, action: KeybindAction, repeats: boolean }> = [
    { setting: 'keybinds.openSettings', action: 'openSettings', repeats: false },
    { setting: 'keybinds.openSettingsAlt', action: 'openSettings', repeats: false },
    { setting: 'keybinds.resetTest', action: 'resetTest', repeats: false },
    { setting: 'keybinds.nextDifficulty', action: 'nextDifficulty', repeats: true },
    { setting: 'keybinds.previousDifficulty', action: 'previousDifficulty', repeats: true },
]

interface KeybindListener {
    action: KeybindAction
    exec: () => void
}

export class KeybindManager {
    #settingsManager: SettingsManager
    #listeners: Array<KeybindListener> = []
    #enabled: boolean = true

    constructor(settingsManager: SettingsManager) {
        this.#settingsManager = settingsManager

        // capturing on the window runs before the input manager's listener, so a bound key never types
        window.addEventListener('keydown', event => {
            if (!this.#enabled) return

            const bind = keybindActions.find(bind => matchesCombo(event, this.#settingsManager.get(bind.setting)))
            if (!bind) return

            event.preventDefault()
            event.stopImmediatePropagation()

            if (event.repeat && !bind.repeats) return

            this.#listeners
                .filter(listener => listener.action === bind.action)
                .forEach(listener => listener.exec())
        }, { capture: true })
    }

    addListener = (action: KeybindAction, exec: () => void) => this.#listeners.push({ action, exec })

    matchesAction = (event: KeyboardEvent, action: KeybindAction) =>
        keybindActions.some(bind => bind.action === action && matchesCombo(event, this.#settingsManager.get(bind.setting)))

    setEnabled = (enabled: boolean) => this.#enabled = enabled
}

import type { SettingsHolder } from '../managers/SettingsManager.ts'

export const defaultSettings: SettingsHolder = {
    [ 'characterCount' ]: {
        name: 'character count',
        value: 60
    }
}
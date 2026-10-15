import type { SettingsManager } from '../managers/SettingsManager.ts'
import { applyTheme } from './themes.ts'

const root = document.documentElement

const applyers = {
    'appearance.theme': (theme: string) => applyTheme(theme),
    'appearance.textSize': (size: number) => root.style.setProperty('--writing-text-scale', `${size / 100}`),
    'appearance.smoothCaret': (smooth: boolean) => root.setAttribute('data-smooth-caret', `${smooth}`),
    'appearance.errorWiggle': (wiggle: boolean) => root.setAttribute('data-error-wiggle', `${wiggle}`),
    'appearance.reduceMotion': (reduce: boolean) => root.setAttribute('data-reduce-motion', `${reduce}`),
} as const

type AppearanceId = keyof typeof applyers

const isAppearanceId = (id: string): id is AppearanceId => id in applyers

/**
 * Applies the appearance settings that only need the stylesheet, and keeps them applied as they change.
 */
export const syncAppearance = (settingsManager: SettingsManager) => {
    for (const id in applyers)
        if (isAppearanceId(id))
            (applyers[id] as (value: unknown) => void)(settingsManager.get(id))

    settingsManager.addListener({
        type: 'valuechange',
        exec: change => {
            if (isAppearanceId(change.id))
                (applyers[change.id] as (value: unknown) => void)(change.value)
        },
    })
}

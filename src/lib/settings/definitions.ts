import { type KeyCombo, keyCombo } from '../utils/keyCombos.ts'
import { layouts } from '../tests/layouts/layouts.ts'
import { dictionaries } from '../tests/dictionaries/dictionaries.ts'
import { TestDifficultyEntries } from '../tests/TestDifficultyEntries.ts'
import { themes } from './themes.ts'

export interface SettingValues {
    'test.length': number
    'test.language': string
    'test.difficulty': string
    'keyboard.layout': string
    'audio.master': number
    'audio.typing': number
    'audio.interface': number
    'audio.results': number
    'appearance.theme': string
    'appearance.caretStyle': string
    'appearance.smoothCaret': boolean
    'appearance.textSize': number
    'appearance.errorWiggle': boolean
    'appearance.reduceMotion': boolean
    'keybinds.openSettings': KeyCombo | null
    'keybinds.openSettingsAlt': KeyCombo | null
    'keybinds.resetTest': KeyCombo | null
    'keybinds.nextDifficulty': KeyCombo | null
    'keybinds.previousDifficulty': KeyCombo | null
    'profile.username': string
}

export type SettingId = keyof SettingValues

interface BaseDefinition {
    label: string
    // extra words the settings search matches
    keywords?: Array<string>
}

export interface SelectDefinition extends BaseDefinition {
    type: 'select'
    options: Array<{ value: string, label: string }>
    default: string
}

export interface RangeDefinition extends BaseDefinition {
    type: 'range'
    min: number
    max: number
    step: number
    default: number
    format: (value: number) => string
}

export interface ToggleDefinition extends BaseDefinition {
    type: 'toggle'
    default: boolean
}

export interface KeybindDefinition extends BaseDefinition {
    type: 'keybind'
    default: KeyCombo | null
}

export interface TextDefinition extends BaseDefinition {
    type: 'text'
    maxLength: number
    placeholder: string
    default: string
}

export type SettingDefinition = SelectDefinition | RangeDefinition | ToggleDefinition | KeybindDefinition | TextDefinition

type DefinitionFor<Value> =
    [Value] extends [number] ? RangeDefinition
        : [Value] extends [boolean] ? ToggleDefinition
            : [Value] extends [string] ? SelectDefinition | TextDefinition
                : KeybindDefinition

const volume = (label: string, keywords: Array<string>): RangeDefinition => ({
    type: 'range',
    label,
    keywords: ['sound', 'audio', ...keywords],
    min: 0,
    max: 100,
    step: 5,
    default: 100,
    format: value => value === 0 ? 'off' : `${value}%`,
})

const optionsOf = (entries: Record<string, { name: string }>) =>
    Object.entries(entries).map(([value, entry]) => ({ value, label: entry.name }))

export const settingDefinitions: { [Id in SettingId]: DefinitionFor<SettingValues[Id]> } = {
    'test.length': {
        type: 'range',
        label: 'length',
        keywords: ['characters', 'count', 'words', 'size'],
        min: 10,
        max: 500,
        step: 10,
        default: 60,
        format: value => `${value} characters`,
    },
    'test.language': {
        type: 'select',
        label: 'language',
        keywords: ['dictionary', 'words'],
        options: optionsOf(dictionaries),
        default: 'english',
    },
    'test.difficulty': {
        type: 'select',
        label: 'difficulty',
        keywords: ['mode', 'hard', 'easy'],
        options: Object.values(TestDifficultyEntries).map(difficulty => ({ value: difficulty.id, label: difficulty.name })),
        default: 'average',
    },
    'keyboard.layout': {
        type: 'select',
        label: 'layout',
        keywords: ['qwerty', 'qwertz', 'dvorak', 'colemak', 'keymap'],
        options: optionsOf(layouts),
        default: 'czechQwertz',
    },
    'audio.master': volume('master volume', ['mute']),
    'audio.typing': volume('typing volume', ['keys', 'clicks']),
    'audio.interface': volume('interface volume', ['menu', 'select']),
    'audio.results': volume('results volume', ['score', 'rank']),
    'appearance.theme': {
        type: 'select',
        label: 'theme',
        keywords: ['color', 'colour', 'palette', 'accent'],
        options: optionsOf(themes),
        default: 'mint',
    },
    'appearance.caretStyle': {
        type: 'select',
        label: 'caret style',
        keywords: ['cursor'],
        options: [
            { value: 'underline', label: 'underline' },
            { value: 'bar', label: 'bar' },
            { value: 'block', label: 'block' },
        ],
        default: 'underline',
    },
    'appearance.smoothCaret': {
        type: 'toggle',
        label: 'smooth caret',
        keywords: ['cursor', 'animation'],
        default: true,
    },
    'appearance.textSize': {
        type: 'range',
        label: 'text size',
        keywords: ['font', 'zoom', 'scale'],
        min: 60,
        max: 150,
        step: 10,
        default: 100,
        format: value => `${value}%`,
    },
    'appearance.errorWiggle': {
        type: 'toggle',
        label: 'error wiggle',
        keywords: ['mistake', 'shake', 'animation'],
        default: true,
    },
    'appearance.reduceMotion': {
        type: 'toggle',
        label: 'reduce motion',
        keywords: ['animation', 'accessibility'],
        default: false,
    },
    'keybinds.openSettings': {
        type: 'keybind',
        label: 'open settings',
        keywords: ['shortcut', 'menu'],
        default: keyCombo('Escape'),
    },
    'keybinds.openSettingsAlt': {
        type: 'keybind',
        label: 'open settings (alt)',
        keywords: ['shortcut', 'menu', 'command palette'],
        default: keyCombo('KeyP', { ctrl: true, shift: true }),
    },
    'keybinds.resetTest': {
        type: 'keybind',
        label: 'reset test',
        keywords: ['shortcut', 'restart', 'retry'],
        default: keyCombo('Backspace', { ctrl: true, shift: true }),
    },
    'keybinds.nextDifficulty': {
        type: 'keybind',
        label: 'next difficulty',
        keywords: ['shortcut', 'cycle'],
        default: keyCombo('Tab'),
    },
    'keybinds.previousDifficulty': {
        type: 'keybind',
        label: 'previous difficulty',
        keywords: ['shortcut', 'cycle'],
        default: keyCombo('Tab', { shift: true }),
    },
    'profile.username': {
        type: 'text',
        label: 'username',
        keywords: ['name', 'nickname', 'results'],
        maxLength: 24,
        placeholder: 'anonymous',
        default: '',
    },
}

export interface ActionDefinition extends BaseDefinition {
    type: 'action'
    button: string
}

export const actionDefinitions = {
    'data.resetAll': {
        type: 'action',
        label: 'reset all settings',
        keywords: ['defaults', 'clear', 'restore'],
        button: 'reset',
    },
} satisfies Record<string, ActionDefinition>

export type ActionId = keyof typeof actionDefinitions

export interface SettingsCategory {
    id: string
    label: string
    entries: Array<SettingId | ActionId>
}

export const settingsCategories: Array<SettingsCategory> = [
    { id: 'test', label: 'test', entries: ['test.length', 'test.language', 'test.difficulty'] },
    { id: 'keyboard', label: 'keyboard', entries: ['keyboard.layout'] },
    { id: 'audio', label: 'audio', entries: ['audio.master', 'audio.typing', 'audio.interface', 'audio.results'] },
    {
        id: 'appearance',
        label: 'appearance',
        entries: ['appearance.theme', 'appearance.caretStyle', 'appearance.smoothCaret', 'appearance.textSize', 'appearance.errorWiggle', 'appearance.reduceMotion'],
    },
    {
        id: 'keybinds',
        label: 'keybinds',
        entries: ['keybinds.openSettings', 'keybinds.openSettingsAlt', 'keybinds.resetTest', 'keybinds.nextDifficulty', 'keybinds.previousDifficulty'],
    },
    { id: 'profile', label: 'profile', entries: ['profile.username'] },
    { id: 'data', label: 'data', entries: ['data.resetAll'] },
]

export const isActionId = (id: string): id is ActionId => id in actionDefinitions

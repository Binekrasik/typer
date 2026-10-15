import { Layout } from './Layout.ts'

// each key maps to its regular character followed by the one typed with shift held, e.g. `'aA'`
export type KeyMap = Record<string, string>

// keys every layout types the same way
const sharedKeys: KeyMap = {
    ['Space']: '  ',
    ['NumpadMultiply']: '**',
    ['NumpadDivide']: '//',
    ['NumpadSubtract']: '--',
    ['NumpadAdd']: '++',
    ['NumpadDecimal']: '..',
}

// the US number row, which the dvorak and colemak variants keep
export const usNumberRow: KeyMap = {
    ['Backquote']: '`~',
    ['Digit1']: '1!',
    ['Digit2']: '2@',
    ['Digit3']: '3#',
    ['Digit4']: '4$',
    ['Digit5']: '5%',
    ['Digit6']: '6^',
    ['Digit7']: '7&',
    ['Digit8']: '8*',
    ['Digit9']: '9(',
    ['Digit0']: '0)',
    ['Minus']: '-_',
    ['Equal']: '=+',
}

/**
 * A layout whose keys only type a regular and a shifted character.
 */
export abstract class KeyMapLayout extends Layout {
    readonly #keys: KeyMap

    protected constructor(keys: KeyMap) {
        super()
        this.#keys = { ...sharedKeys, ...keys }
    }

    matchCharacter(code: string, modifiers?: Array<string>) {
        const key = this.#keys[code]
        if (!key) return null

        // same as the czech layout, any other combination of modifiers types the regular character
        const modifier = modifiers?.join(' ')
        return modifier === 'ShiftLeft' || modifier === 'ShiftRight' ? key[1] : key[0]
    }
}

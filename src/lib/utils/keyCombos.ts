export interface KeyCombo {
    // physical key from `KeyboardEvent.code`, so binds don't move when the layout changes
    code: string
    ctrl: boolean
    shift: boolean
    alt: boolean
    meta: boolean
}

export type KeyEventLike = Pick<KeyboardEvent, 'code' | 'ctrlKey' | 'shiftKey' | 'altKey' | 'metaKey'>

export const keyCombo = (code: string, modifiers: Partial<Omit<KeyCombo, 'code'>> = {}): KeyCombo => ({
    code,
    ctrl: false,
    shift: false,
    alt: false,
    meta: false,
    ...modifiers,
})

export const isModifierCode = (code: string) => /^(Control|Shift|Alt|Meta|OS)(Left|Right)$/.test(code)

// keys that type something in the test, binding them without ctrl, alt or meta would make them untypable
const typingCodes = ['Space', 'Backquote', 'Minus', 'Equal', 'BracketLeft', 'BracketRight', 'Backslash', 'Semicolon', 'Quote', 'Comma', 'Period', 'Slash', 'IntlBackslash']

export const typesCharacter = (combo: KeyCombo) =>
    !combo.ctrl && !combo.alt && !combo.meta
    && (/^(Key|Digit|Numpad(\d|Multiply|Divide|Subtract|Add|Decimal))/.test(combo.code) || typingCodes.includes(combo.code))

export const comboFromEvent = (event: KeyEventLike): KeyCombo | null =>
    isModifierCode(event.code) ? null : keyCombo(event.code, {
        ctrl: event.ctrlKey,
        shift: event.shiftKey,
        alt: event.altKey,
        meta: event.metaKey,
    })

export const matchesCombo = (event: KeyEventLike, combo: KeyCombo | null) =>
    combo !== null
    && event.code === combo.code
    && event.ctrlKey === combo.ctrl
    && event.shiftKey === combo.shift
    && event.altKey === combo.alt
    && event.metaKey === combo.meta

export const combosEqual = (a: KeyCombo | null, b: KeyCombo | null) =>
    a === b || (a !== null && b !== null
        && a.code === b.code && a.ctrl === b.ctrl && a.shift === b.shift && a.alt === b.alt && a.meta === b.meta)

const keyNames: Record<string, string> = {
    ['Escape']: 'esc',
    ['Backquote']: '`',
    ['Minus']: '-',
    ['Equal']: '=',
    ['BracketLeft']: '[',
    ['BracketRight']: ']',
    ['Backslash']: '\\',
    ['IntlBackslash']: '\\',
    ['Semicolon']: ';',
    ['Quote']: '\'',
    ['Comma']: ',',
    ['Period']: '.',
    ['Slash']: '/',
    ['ArrowUp']: 'up',
    ['ArrowDown']: 'down',
    ['ArrowLeft']: 'left',
    ['ArrowRight']: 'right',
}

export const formatKeyCode = (code: string) =>
    keyNames[code]
    ?? code.match(/^(?:Key|Digit)(.)$/)?.[1].toLowerCase()
    ?? code.replace(/^Numpad/, 'num ').replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase()

export const formatCombo = (combo: KeyCombo | null) => combo
    ? [
        combo.ctrl && 'ctrl',
        combo.meta && 'meta',
        combo.alt && 'alt',
        combo.shift && 'shift',
        formatKeyCode(combo.code),
    ].filter(Boolean).join(' + ')
    : 'unbound'

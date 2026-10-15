import { describe, expect, test } from 'bun:test'
import { comboFromEvent, formatCombo, keyCombo, matchesCombo, typesCharacter } from '../src/lib/utils/keyCombos.ts'

const event = (code: string, modifiers: { ctrlKey?: boolean, shiftKey?: boolean, altKey?: boolean, metaKey?: boolean } = {}) =>
    ({ code, ctrlKey: false, shiftKey: false, altKey: false, metaKey: false, ...modifiers })

describe('key combos', () => {
    test('formats combos the way the app writes them', () => {
        expect(formatCombo(keyCombo('Backspace', { ctrl: true, shift: true }))).toBe('ctrl + shift + backspace')
        expect(formatCombo(keyCombo('KeyP', { ctrl: true, shift: true }))).toBe('ctrl + shift + p')
        expect(formatCombo(keyCombo('Escape'))).toBe('esc')
        expect(formatCombo(keyCombo('Digit4', { alt: true }))).toBe('alt + 4')
        expect(formatCombo(keyCombo('Numpad7', { ctrl: true }))).toBe('ctrl + num 7')
        expect(formatCombo(keyCombo('PageDown'))).toBe('page down')
        expect(formatCombo(keyCombo('BracketLeft', { meta: true }))).toBe('meta + [')
        expect(formatCombo(null)).toBe('unbound')
    })

    test('matches only the exact modifiers', () => {
        const tab = keyCombo('Tab')

        expect(matchesCombo(event('Tab'), tab)).toBe(true)
        expect(matchesCombo(event('Tab', { shiftKey: true }), tab)).toBe(false)
        expect(matchesCombo(event('Tab', { shiftKey: true }), keyCombo('Tab', { shift: true }))).toBe(true)
        expect(matchesCombo(event('Tab'), null)).toBe(false)
    })

    test('builds combos from events, but not from lone modifiers', () => {
        expect(comboFromEvent(event('ShiftLeft', { shiftKey: true }))).toBeNull()
        expect(comboFromEvent(event('ControlRight', { ctrlKey: true }))).toBeNull()
        expect(comboFromEvent(event('KeyK', { ctrlKey: true, altKey: true }))).toEqual(keyCombo('KeyK', { ctrl: true, alt: true }))
    })

    test('knows which combos would type in the test', () => {
        expect(typesCharacter(keyCombo('KeyA'))).toBe(true)
        expect(typesCharacter(keyCombo('KeyA', { shift: true }))).toBe(true)
        expect(typesCharacter(keyCombo('Space'))).toBe(true)
        expect(typesCharacter(keyCombo('Digit1'))).toBe(true)
        expect(typesCharacter(keyCombo('Quote'))).toBe(true)
        expect(typesCharacter(keyCombo('KeyA', { ctrl: true }))).toBe(false)
        expect(typesCharacter(keyCombo('Tab'))).toBe(false)
        expect(typesCharacter(keyCombo('F2'))).toBe(false)
        expect(typesCharacter(keyCombo('NumpadEnter'))).toBe(false)
    })
})

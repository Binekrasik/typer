import { describe, expect, test } from 'bun:test'
import { layouts } from '../src/lib/tests/layouts/layouts.ts'

const codes = [
    'Backquote', 'Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9', 'Digit0', 'Minus', 'Equal',
    'KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyT', 'KeyY', 'KeyU', 'KeyI', 'KeyO', 'KeyP', 'BracketLeft', 'BracketRight', 'Backslash',
    'KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyG', 'KeyH', 'KeyJ', 'KeyK', 'KeyL', 'Semicolon', 'Quote',
    'KeyZ', 'KeyX', 'KeyC', 'KeyV', 'KeyB', 'KeyN', 'KeyM', 'Comma', 'Period', 'Slash',
]

describe('layouts', () => {
    for (const [id, entry] of Object.entries(layouts)) {
        const layout = entry.create()

        test(`${id} types every letter exactly once`, () => {
            const letters = codes.map(code => layout.matchCharacter(code)).filter(character => character && /^[a-z]$/.test(character))
            expect(letters.sort()).toEqual([...'abcdefghijklmnopqrstuvwxyz'])
        })

        test(`${id} shifts letters to uppercase`, () => {
            for (const code of codes) {
                const regular = layout.matchCharacter(code)
                if (regular && /^[a-z]$/.test(regular))
                    expect(layout.matchCharacter(code, ['ShiftLeft'])).toBe(regular.toUpperCase())
            }
        })

        test(`${id} shares the modifier and meta keys`, () => {
            expect(layout.isModifier('ShiftRight')).toBe(true)
            expect(layout.isModifier('KeyA')).toBe(false)
            expect(layout.matchMetaKey('NumpadEnter')).toBe('Enter')
            expect(layout.matchCharacter('Space')).toBe(' ')
        })
    }

    test('maps keys where each layout puts them', () => {
        const type = (id: string, code: string, modifiers?: Array<string>) => layouts[id].create().matchCharacter(code, modifiers)

        expect(type('czechQwertz', 'KeyY')).toBe('z')
        expect(type('czechQwertz', 'Digit2')).toBe('ě')
        expect(type('usQwerty', 'Digit2', ['ShiftRight'])).toBe('@')
        expect(type('usQwerty', 'Quote', ['ShiftLeft'])).toBe('"')
        expect(type('dvorak', 'KeyS')).toBe('o')
        expect(type('dvorak', 'KeyQ')).toBe('\'')
        expect(type('dvorak', 'Minus')).toBe('[')
        expect(type('colemak', 'KeyK')).toBe('e')
        expect(type('colemak', 'KeyP', ['ShiftLeft'])).toBe(':')
        // any other modifier types the regular character, same as the czech layout
        expect(type('colemak', 'KeyK', ['ControlLeft'])).toBe('e')
    })

    test('letters are located by the key typing them', () => {
        const dvorak = layouts.dvorak.create()
        expect(dvorak.locateCharacter('h')).toEqual({ x: 7.75, y: 2, finger: 4 })
    })
})

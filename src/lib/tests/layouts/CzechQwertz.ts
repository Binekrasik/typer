import { type CharacterMap, Layout } from './Layout.ts'

// o.o
const characters: CharacterMap = {
    [ 'KeyA' ]: {
        regular: 'a',
        modified: ( modifiers: string ) => {
            return {
                'ShiftLeft': 'A',
                'ShiftRight': 'A',
                'AltRight': '~',
            }[ modifiers ] ?? null
        },
    },
    [ 'KeyB' ]: {
        regular: 'b',
        modified: ( modifiers: string ) => {
            return {
                'ShiftLeft': 'B',
                'ShiftRight': 'B',
                'AltRight': '{',
            }[ modifiers ] ?? null
        },
    },
    [ 'KeyC' ]: {
        regular: 'c',
        modified: ( modifiers: string ) => {
            return {
                'ShiftLeft': 'C',
                'ShiftRight': 'C',
                'AltRight': '&',
            }[ modifiers ] ?? null
        },
    },
    [ 'KeyD' ]: {
        regular: 'd',
        modified: ( modifiers: string ) => {
            return {
                'ShiftLeft': 'D',
                'ShiftRight': 'D',
                'AltRight': 'Đ',
            }[ modifiers ] ?? null
        },
    },
    [ 'KeyE' ]: {
        regular: 'e',
        modified: ( modifiers: string ) => {
            return {
                'ShiftLeft': 'E',
                'ShiftRight': 'E',
                'AltRight': '€',
            }[ modifiers ] ?? null
        },
    },
    [ 'KeyF' ]: {
        regular: 'f',
        modified: ( modifiers: string ) => {
            return {
                'ShiftLeft': 'F',
                'ShiftRight': 'F',
                'AltRight': '[',
            }[ modifiers ] ?? null
        },
    },
    [ 'KeyG' ]: {
        regular: 'g',
        modified: ( modifiers: string ) => {
            return {
                'ShiftLeft': 'G',
                'ShiftRight': 'G',
                'AltRight': ']',
            }[ modifiers ] ?? null
        },
    },
    [ 'KeyH' ]: {
        regular: 'h',
        modified: ( modifiers: string ) => {
            return {
                'ShiftLeft': 'H',
                'ShiftRight': 'H',
                'AltRight': '`',
            }[ modifiers ] ?? null
        },
    },
    [ 'KeyI' ]: {
        regular: 'i',
        modified: ( modifiers: string ) => {
            return {
                'ShiftLeft': 'I',
                'ShiftRight': 'I',
                'AltRight': '→',
            }[ modifiers ] ?? null
        },
    },
    [ 'KeyJ' ]: {
        regular: 'j',
        modified: ( modifiers: string ) => {
            return {
                'ShiftLeft': 'J',
                'ShiftRight': 'J',
                'AltRight': '\'',
            }[ modifiers ] ?? null
        },
    },
    [ 'KeyK' ]: {
        regular: 'k',
        modified: ( modifiers: string ) => {
            return {
                'ShiftLeft': 'K',
                'ShiftRight': 'K',
                'AltRight': 'ł',
            }[ modifiers ] ?? null
        },
    },
    [ 'KeyL' ]: {
        regular: 'l',
        modified: ( modifiers: string ) => {
            return {
                'ShiftLeft': 'L',
                'ShiftRight': 'L',
                'AltRight': 'Ł',
            }[ modifiers ] ?? null
        },
    },
    [ 'KeyM' ]: {
        regular: 'm',
        modified: ( modifiers: string ) => {
            return {
                'ShiftLeft': 'M',
                'ShiftRight': 'M',
                'AltRight': '^',
            }[ modifiers ] ?? null
        },
    },
    [ 'KeyN' ]: {
        regular: 'n',
        modified: ( modifiers: string ) => {
            return {
                'ShiftLeft': 'N',
                'ShiftRight': 'N',
                'AltRight': '}',
            }[ modifiers ] ?? null
        },
    },
    [ 'KeyO' ]: {
        regular: 'o',
        modified: ( modifiers: string ) => {
            return {
                'ShiftLeft': 'O',
                'ShiftRight': 'O',
                'AltRight': 'ø',
            }[ modifiers ] ?? null
        },
    },
    [ 'KeyP' ]: {
        regular: 'p',
        modified: ( modifiers: string ) => {
            return {
                'ShiftLeft': 'P',
                'ShiftRight': 'P',
                'AltRight': 'þ',
            }[ modifiers ] ?? null
        },
    },
    [ 'KeyQ' ]: {
        regular: 'q',
        modified: ( modifiers: string ) => {
            return {
                'ShiftLeft': 'Q',
                'ShiftRight': 'Q',
                'AltRight': '\\',
            }[ modifiers ] ?? null
        },
    },
    [ 'KeyR' ]: {
        regular: 'r',
        modified: ( modifiers: string ) => {
            return {
                'ShiftLeft': 'R',
                'ShiftRight': 'R',
                'AltRight': '¶',
            }[ modifiers ] ?? null
        },
    },
    [ 'KeyS' ]: {
        regular: 's',
        modified: ( modifiers: string ) => {
            return {
                'ShiftLeft': 'S',
                'ShiftRight': 'S',
                'AltRight': 'đ',
            }[ modifiers ] ?? null
        },
    },
    [ 'KeyT' ]: {
        regular: 't',
        modified: ( modifiers: string ) => {
            return {
                'ShiftLeft': 'T',
                'ShiftRight': 'T',
                'AltRight': 'ŧ',
            }[ modifiers ] ?? null
        },
    },
    [ 'KeyU' ]: {
        regular: 'u',
        modified: ( modifiers: string ) => {
            return {
                'ShiftLeft': 'U',
                'ShiftRight': 'U',
                'AltRight': '↓',
            }[ modifiers ] ?? null
        },
    },
    [ 'KeyV' ]: {
        regular: 'v',
        modified: ( modifiers: string ) => {
            return {
                'ShiftLeft': 'V',
                'ShiftRight': 'V',
                'AltRight': '@',
            }[ modifiers ] ?? null
        },
    },
    [ 'KeyW' ]: {
        regular: 'w',
        modified: ( modifiers: string ) => {
            return {
                'ShiftLeft': 'W',
                'ShiftRight': 'W',
                'AltRight': '|',
            }[ modifiers ] ?? null
        },
    },
    [ 'KeyX' ]: {
        regular: 'x',
        modified: ( modifiers: string ) => {
            return {
                'ShiftLeft': 'X',
                'ShiftRight': 'X',
                'AltRight': '#',
            }[ modifiers ] ?? null
        },
    },
    [ 'KeyY' ]: {
        regular: 'z',
        modified: ( modifiers: string ) => {
            return {
                'ShiftLeft': 'Z',
                'ShiftRight': 'Z',
                'AltRight': '←',
            }[ modifiers ] ?? null
        },
    },
    [ 'KeyZ' ]: {
        regular: 'y',
        modified: ( modifiers: string ) => {
            return {
                'ShiftLeft': 'Y',
                'ShiftRight': 'Y',
                'AltRight': '°',
            }[ modifiers ] ?? null
        },
    },
    [ 'Comma' ]: {
        regular: ',',
        modified: ( modifiers: string ) => {
            return {
                'ShiftLeft': '?',
                'ShiftRight': '?',
                'AltRight': '<',
            }[ modifiers ] ?? null
        },
    },
    [ 'Period' ]: {
        regular: '.',
        modified: ( modifiers: string ) => {
            return {
                'ShiftLeft': ':',
                'ShiftRight': ':',
                'AltRight': '>',

            }[ modifiers ] ?? null
        },
    },
    [ 'Backquote' ]: {
        regular: ';',
        modified: ( modifiers: string ) => {
            return {
                'ShiftLeft': '°',
                'ShiftRight': '°',
                'AltRight': '`',
            }[ modifiers ] ?? null
        },
    },
    [ 'Minus' ]: {
        regular: '=',
        modified: ( modifiers: string ) => {
            return {
                'ShiftLeft': '%',
                'ShiftRight': '%',
                'AltRight': '\\',
            }[ modifiers ] ?? null
        },
    },
    [ 'Equal' ]: {
        regular: '-',
        modified: ( modifiers: string ) => {
            return {
                'ShiftLeft': 'ˇ',
                'ShiftRight': 'ˇ',
                'AltRight': '¯',
            }[ modifiers ] ?? null
        },
    },
    [ 'BracketLeft' ]: {
        regular: 'ú',
        modified: ( modifiers: string ) => {
            return {
                'ShiftLeft': '/',
                'ShiftRight': '/',
                'AltRight': '[',
            }[ modifiers ] ?? null
        },
    },
    [ 'BracketRight' ]: {
        regular: ')',
        modified: ( modifiers: string ) => {
            return {
                'ShiftLeft': '(',
                'ShiftRight': '(',
                'AltRight': ']',
            }[ modifiers ] ?? null
        },
    },
    [ 'Semicolon' ]: {
        regular: 'ů',
        modified: ( modifiers: string ) => {
            return {
                'ShiftLeft': '"',
                'ShiftRight': '"',
                'AltRight': '$',
            }[ modifiers ] ?? null
        },
    },
    [ 'Quote' ]: {
        regular: '§',
        modified: ( modifiers: string ) => {
            return {
                'ShiftLeft': '!',
                'ShiftRight': '!',
                'AltRight': '\'',
            }[ modifiers ] ?? null
        },
    },
    [ 'Backslash' ]: {
        regular: '¨',
        modified: ( modifiers: string ) => {
            return {
                'ShiftLeft': '\'',
                'ShiftRight': '\'',
                'AltRight': '\\',
            }[ modifiers ] ?? null
        },
    },
    [ 'Slash' ]: {
        regular: '-',
        modified: ( modifiers: string ) => {
            return {
                'ShiftLeft': '_',
                'ShiftRight': '_',
                'AltRight': '*',
            }[ modifiers ] ?? null
        },
    },
    [ 'Digit1' ]: {
        regular: '+',
        modified: ( modifiers: string ) => {
            return {
                'ShiftLeft': '1',
                'ShiftRight': '1',
                'AltRight': '!',
            }[ modifiers ] ?? null
        },
    },
    [ 'Digit2' ]: {
        regular: 'ě',
        modified: ( modifiers: string ) => {
            return {
                'ShiftLeft': '2',
                'ShiftRight': '2',
                'AltRight': '@',
            }[ modifiers ] ?? null
        },
    },
    [ 'Digit3' ]: {
        regular: 'š',
        modified: ( modifiers: string ) => {
            return {
                'ShiftLeft': '3',
                'ShiftRight': '3',
                'AltRight': '#',
            }[ modifiers ] ?? null
        },
    },
    [ 'Digit4' ]: {
        regular: 'č',
        modified: ( modifiers: string ) => {
            return {
                'ShiftLeft': '4',
                'ShiftRight': '4',
                'AltRight': '$',
            }[ modifiers ] ?? null
        },
    },
    [ 'Digit5' ]: {
        regular: 'ř',
        modified: ( modifiers: string ) => {
            return {
                'ShiftLeft': '5',
                'ShiftRight': '5',
                'AltRight': '%',
            }[ modifiers ] ?? null
        },
    },
    [ 'Digit6' ]: {
        regular: 'ž',
        modified: ( modifiers: string ) => {
            return {
                'ShiftLeft': '6',
                'ShiftRight': '6',
                'AltRight': '^',
            }[ modifiers ] ?? null
        },
    },
    [ 'Digit7' ]: {
        regular: 'ý',
        modified: ( modifiers: string ) => {
            return {
                'ShiftLeft': '7',
                'ShiftRight': '7',
                'AltRight': '&',
            }[ modifiers ] ?? null
        },
    },
    [ 'Digit8' ]: {
        regular: 'á',
        modified: ( modifiers: string ) => {
            return {
                'ShiftLeft': '8',
                'ShiftRight': '8',
                'AltRight': '*',
            }[ modifiers ] ?? null
        },
    },
    [ 'Digit9' ]: {
        regular: 'í',
        modified: ( modifiers: string ) => {
            return {
                'ShiftLeft': '9',
                'ShiftRight': '9',
                'AltRight': '{',
            }[ modifiers ] ?? null
        },
    },
    [ 'Digit0' ]: {
        regular: 'é',
        modified: ( modifiers: string ) => {
            return {
                'ShiftLeft': '0',
                'ShiftRight': '0',
                'AltRight': '}',
            }[ modifiers ] ?? null
        },
    },
    [ 'Space' ]: {
        regular: ' ',
        modified: ( _modifiers: string ) => null,
    },
    [ 'NumpadMultiply' ]: {
        regular: '*',
        modified: ( _modifiers: string ) => null
    },
    [ 'NumpadDivide' ]: {
        regular: '/',
        modified: ( _modifiers: string ) => null
    },
    [ 'NumpadSubtract' ]: {
        regular: '-',
        modified: ( _modifiers: string ) => null
    },
    [ 'NumpadAdd' ]: {
        regular: '+',
        modified: ( _modifiers: string ) => null
    },
    [ 'NumpadDecimal' ]: {
        regular: '.',
        modified: ( _modifiers: string ) => null
    },
}

const modifiers = [
    'ShiftLeft', 'ShiftRight',
    'ControlLeft', 'ControlRight',
    'AltLeft', 'AltRight',
]

const metaKeys = {
    [ 'Tab' ]: 'Tab',
    [ 'CapsLock' ]: 'CapsLock',
    [ 'Escape' ]: 'Escape',
    [ 'Backspace' ]: 'Backspace',
    [ 'Enter' ]: 'Enter',
    [ 'NumpadEnter' ]: 'Enter',
}

export class CzechQwertz extends Layout {
    matchCharacter ( code: string, modifiers?: Array< string > ) {
        const char = characters[ code ]
        const modified = char && modifiers ? char.modified( modifiers.join( ' ' ) ) : null
        // console.debug( `${ code } -> ${ char ? modified ? modified : char.regular : null }\nmodifiers: ${ modifiers?.join( ' ' ) }` )

        return char ? modified ? modified : char.regular : null
    }

    matchMetaKey ( code: string ) {
        // @ts-ignore
        const key = metaKeys[ code ]
        return key ? key : null
    }

    isModifier = ( code: string ) => modifiers.includes( code )
}
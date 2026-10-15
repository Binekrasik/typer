import { KeyMapLayout, usNumberRow } from './KeyMapLayout.ts'

export class Dvorak extends KeyMapLayout {
    constructor() {
        super({
            ...usNumberRow,
            ['Minus']: '[{', ['Equal']: ']}',

            ['KeyQ']: '\'"', ['KeyW']: ',<', ['KeyE']: '.>', ['KeyR']: 'pP', ['KeyT']: 'yY',
            ['KeyY']: 'fF', ['KeyU']: 'gG', ['KeyI']: 'cC', ['KeyO']: 'rR', ['KeyP']: 'lL',
            ['BracketLeft']: '/?', ['BracketRight']: '=+', ['Backslash']: '\\|',

            ['KeyA']: 'aA', ['KeyS']: 'oO', ['KeyD']: 'eE', ['KeyF']: 'uU', ['KeyG']: 'iI',
            ['KeyH']: 'dD', ['KeyJ']: 'hH', ['KeyK']: 'tT', ['KeyL']: 'nN',
            ['Semicolon']: 'sS', ['Quote']: '-_',

            ['IntlBackslash']: '\\|',
            ['KeyZ']: ';:', ['KeyX']: 'qQ', ['KeyC']: 'jJ', ['KeyV']: 'kK', ['KeyB']: 'xX',
            ['KeyN']: 'bB', ['KeyM']: 'mM', ['Comma']: 'wW', ['Period']: 'vV', ['Slash']: 'zZ',
        })
    }
}

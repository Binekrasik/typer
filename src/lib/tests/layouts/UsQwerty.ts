import { KeyMapLayout, usNumberRow } from './KeyMapLayout.ts'

export class UsQwerty extends KeyMapLayout {
    constructor() {
        super({
            ...usNumberRow,

            ['KeyQ']: 'qQ', ['KeyW']: 'wW', ['KeyE']: 'eE', ['KeyR']: 'rR', ['KeyT']: 'tT',
            ['KeyY']: 'yY', ['KeyU']: 'uU', ['KeyI']: 'iI', ['KeyO']: 'oO', ['KeyP']: 'pP',
            ['BracketLeft']: '[{', ['BracketRight']: ']}', ['Backslash']: '\\|',

            ['KeyA']: 'aA', ['KeyS']: 'sS', ['KeyD']: 'dD', ['KeyF']: 'fF', ['KeyG']: 'gG',
            ['KeyH']: 'hH', ['KeyJ']: 'jJ', ['KeyK']: 'kK', ['KeyL']: 'lL',
            ['Semicolon']: ';:', ['Quote']: '\'"',

            ['IntlBackslash']: '\\|',
            ['KeyZ']: 'zZ', ['KeyX']: 'xX', ['KeyC']: 'cC', ['KeyV']: 'vV', ['KeyB']: 'bB',
            ['KeyN']: 'nN', ['KeyM']: 'mM', ['Comma']: ',<', ['Period']: '.>', ['Slash']: '/?',
        })
    }
}

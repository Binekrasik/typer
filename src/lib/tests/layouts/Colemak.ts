import { KeyMapLayout, usNumberRow } from './KeyMapLayout.ts'

export class Colemak extends KeyMapLayout {
    constructor() {
        super({
            ...usNumberRow,

            ['KeyQ']: 'qQ', ['KeyW']: 'wW', ['KeyE']: 'fF', ['KeyR']: 'pP', ['KeyT']: 'gG',
            ['KeyY']: 'jJ', ['KeyU']: 'lL', ['KeyI']: 'uU', ['KeyO']: 'yY', ['KeyP']: ';:',
            ['BracketLeft']: '[{', ['BracketRight']: ']}', ['Backslash']: '\\|',

            ['KeyA']: 'aA', ['KeyS']: 'rR', ['KeyD']: 'sS', ['KeyF']: 'tT', ['KeyG']: 'dD',
            ['KeyH']: 'hH', ['KeyJ']: 'nN', ['KeyK']: 'eE', ['KeyL']: 'iI',
            ['Semicolon']: 'oO', ['Quote']: '\'"',

            ['IntlBackslash']: '\\|',
            ['KeyZ']: 'zZ', ['KeyX']: 'xX', ['KeyC']: 'cC', ['KeyV']: 'vV', ['KeyB']: 'bB',
            ['KeyN']: 'kK', ['KeyM']: 'mM', ['Comma']: ',<', ['Period']: '.>', ['Slash']: '/?',
        })
    }
}

export interface CharacterObject {
    regular: string
    modified: ( modifiers: string ) => string | null
}

export interface CharacterMap { [ code: string ]: CharacterObject }

export interface KeyPosition {
    x: number
    y: number
    // touch typing finger, 0 is the left pinky and 7 the right pinky
    finger: number
}

// row-staggered keyboard (ANSI/ISO), rows are offset in key widths from the left edge of the number row
// and their keys are grouped by the finger typing them, from the left pinky to the right pinky
const physicalKeyRows: Array< { offset: number, fingers: Array< Array< string > > } > = [
    { offset: 0, fingers: [ [ 'Backquote', 'Digit1' ], [ 'Digit2' ], [ 'Digit3' ], [ 'Digit4', 'Digit5' ], [ 'Digit6', 'Digit7' ], [ 'Digit8' ], [ 'Digit9' ], [ 'Digit0', 'Minus', 'Equal' ] ] },
    { offset: 1.5, fingers: [ [ 'KeyQ' ], [ 'KeyW' ], [ 'KeyE' ], [ 'KeyR', 'KeyT' ], [ 'KeyY', 'KeyU' ], [ 'KeyI' ], [ 'KeyO' ], [ 'KeyP', 'BracketLeft', 'BracketRight' ] ] },
    { offset: 1.75, fingers: [ [ 'KeyA' ], [ 'KeyS' ], [ 'KeyD' ], [ 'KeyF', 'KeyG' ], [ 'KeyH', 'KeyJ' ], [ 'KeyK' ], [ 'KeyL' ], [ 'Semicolon', 'Quote', 'Backslash' ] ] },
    { offset: 1.25, fingers: [ [ 'IntlBackslash', 'KeyZ' ], [ 'KeyX' ], [ 'KeyC' ], [ 'KeyV', 'KeyB' ], [ 'KeyN', 'KeyM' ], [ 'Comma' ], [ 'Period' ], [ 'Slash' ] ] },
]

export abstract class Layout {
    #characterPositions: Map< string, KeyPosition > | null = null

    /**
     * Matches a keycode with an actual character.
     * @param code character code from `KeyboardEvent.code`
     * @param modifiers an array of character modifiers as string codes from `KeyboardEvent.code`
     * @returns `string` if successfully matched
     * @returns `null` when couldn't match
     */
    abstract matchCharacter ( code: string, modifiers?: Array< string > ): string | null
    abstract matchMetaKey ( code: string ): string | null
    abstract isModifier ( code: string ): boolean

    /**
     * Finds where the key typing an unmodified `character` physically sits.
     * @returns `KeyPosition` measured in key widths
     * @returns `null` when no key types the character
     */
    locateCharacter ( character: string ): KeyPosition | null {
        this.#characterPositions ??= this.mapCharacterPositions()
        return this.#characterPositions.get( character ) ?? null
    }

    private mapCharacterPositions () {
        const positions = new Map< string, KeyPosition >()

        physicalKeyRows.forEach( ( row, y ) => {
            let x = row.offset

            row.fingers.forEach( ( codes, finger ) => codes.forEach( code => {
                const character = this.matchCharacter( code )
                if ( character && !positions.has( character ) )
                    positions.set( character, { x, y, finger } )

                x++
            }))
        })

        return positions
    }
}
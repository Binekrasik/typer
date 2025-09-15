export interface CharacterObject {
    regular: string
    modified: ( modifiers: string ) => string | null
}

export interface CharacterMap { [ code: string ]: CharacterObject }

export abstract class Layout {
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
}
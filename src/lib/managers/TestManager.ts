import type { Dictionary } from '../tests/dictionaries/Dictionary.ts'
import { EnglishBritish } from '../tests/dictionaries/EnglishBritish.ts'
import { WordEntity } from '../tests/WordEntity.ts'
import type { TestState } from '../tests/TestState.ts'

export class TestManager {
    static #emptyTestState: TestState = {
        current: {
            word: {
                index: 0,
                length: 0,
            },
            character: {
                index: 0,
                symbol: ''
            },
        },
    }

    #dictionary: Dictionary

    // variables modified by test generation
    #writingArea: HTMLDivElement
    #testState: TestState = TestManager.#emptyTestState
    #words: Array< WordEntity > = []
    #testLength: number = 0

    constructor () {
        // find the writing area
        const areaElement = document.querySelector( '#testWritingArea' )
        if ( !areaElement )
            throw Error( 'Expected HTMLDivElement from query for "#testWritingArea", got null instead.' )

        this.#writingArea = areaElement as HTMLDivElement

        // hardcoded default dictionary for now
        this.#dictionary = new EnglishBritish()
        this.clearTest()
    }

    clearTest () {
        this.#writingArea.innerHTML = ''
        this.#testState = TestManager.#emptyTestState
        this.#words = []
        this.#testLength = 0
    }

    regenerateTest ( wordCount: number ) {
        this.clearTest()
        this.appendRandomWords( wordCount )

        this.#testState = {
            current: {
                word: {
                    index: 0,
                    length: this.#words[ 0 ].length,
                },
                character: {
                    index: 0,
                    symbol: this.getCurrentCharacterSymbol()
                },
            },
        }

        this.highlightCurrentCharacter()
    }

    appendWord ( word: WordEntity ) {
        const html = word.toSpanArray()

        this.#writingArea.innerHTML += `<div class="word" id="currentTest-word-${ word.index }">${ html.join( '' ) }</div>`
        this.#words[ word.index ] = word

        this.#testLength += word.length + ( word.index != 0 ? 1 : 0 )
    }

    appendRandomWords ( amount: number ) {
        for ( let i = 0; i < amount; i++ )
            this.appendWord( new WordEntity( this.#dictionary.nextWord(), i ) )
    }

    getCurrentCharacterSymbol = () => this.#words[ this.#testState.current.word.index ].getSymbol( this.#testState.current.character.index ) ?? 'ERROR' // top-notch error handling right there

    changeDictionary = ( dictionary: Dictionary ) => this.#dictionary = dictionary

    highlightCurrentCharacter = () => this.highlightCharacter({
        word: this.#testState.current.word.index,
        character: this.#testState.current.character.index,
    })

    highlightCharacter ( index: { word: number, character: number } ) {
        const unchecked = document.querySelector( `#currentTest-word-${ index.word }-letter-${ index.character }` )
        if ( !unchecked )
            throw Error( `Character with word index ${ index.word } and character index ${ index.character } doesn't exist.` )

        const span = unchecked as HTMLSpanElement
        span.setAttribute( 'data-state', 'highlighted' )
    }

    advanceCurrentWord () {
        this.#testState.current.word.index++
        this.#testState.current.word.length = this.#words[ this.#testState.current.word.index ].length
        this.#testState.current.character.index = 0

        this.#testState.current.character.symbol = this.getCurrentCharacterSymbol()
        this.highlightCurrentCharacter()
    }

    advanceCurrentCharacter () {
        if (
            this.#testState.current.word.index === this.#words.length - 1
            && this.#testState.current.character.index === this.#testState.current.word.length - 1
        ) return // fail gracefully

        this.#testState.current.character.index++

        if ( this.didReachWordEnd() )
            return

        this.#testState.current.character.symbol = this.getCurrentCharacterSymbol()
        this.highlightCurrentCharacter()
    }

    didReachWordEnd = () =>
        this.#testState.current.character.index === this.#testState.current.word.length
        && !this.#words[ this.#testState.current.word.index ].getSymbol( this.#testState.current.character.index )

    typeCharacter ( input: string ): boolean {
        if ( this.#testState.current.character.symbol === input ) {
            const currentUnchecked = document.querySelector( `#currentTest-word-${ this.#testState.current.word.index }-letter-${ this.#testState.current.character.index }` )
            if ( !currentUnchecked )
                return false

            const currentSpan = currentUnchecked as HTMLSpanElement
            currentSpan.setAttribute( 'data-state', 'typed' )

            this.advanceCurrentCharacter()

            return true
        }

        if ( input === ' ' && this.didReachWordEnd() ) {
            this.advanceCurrentWord()
            return true
        }

        return false
    }

    getTestLength = () => this.#testLength
}
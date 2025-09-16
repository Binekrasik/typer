import type { Dictionary } from '../tests/dictionaries/Dictionary.ts'
import { EnglishBritish } from '../tests/dictionaries/EnglishBritish.ts'
import { WordEntity } from '../tests/WordEntity.ts'
import type { TestState } from '../tests/TestState.ts'
import { arrayYoink } from '../utils/arrays.ts'

type TestEventType = 'finish' | 'start' | 'generate'
type TestEventListenerExec = () => void

interface TestEventListener {
    type: TestEventType
    exec: TestEventListenerExec
}

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

        total: {
            charactersWritten: {
                correct: 0,
                total: 0,
            },
            test: {
                start: -1,
                end: 0,
                total: 1,
                length: 0,
                result: null,
            },
        },
    }

    #dictionary: Dictionary
    #listeners: Array< TestEventListener > = []

    #caretElement: HTMLDivElement

    // variables modified by test generation
    #writingArea: HTMLDivElement
    #testState: TestState = TestManager.#emptyTestState
    #words: Array< WordEntity > = []
    #needsRegenerating: boolean = false

    constructor () {
        // find the writing area
        const areaElement = document.querySelector( '#testWritingArea' )
        if ( !areaElement )
            throw Error( 'Expected HTMLDivElement from query for "#testWritingArea", got nothing instead.' )

        this.#writingArea = areaElement as HTMLDivElement

        // find the caret element
        const caretElement = document.querySelector( '#testCaret' )
        if ( !caretElement )
            throw Error( 'Expected HTMLDivElement from query for "#testCaret", got nothing instead.' )

        this.#caretElement = caretElement as HTMLDivElement

        // hardcoded default dictionary for now
        this.#dictionary = new EnglishBritish()
        this.clearTest()
    }

    // --- - - - - - - - ---
    //        EVENTS
    // --- - - - - - - - ---

    callListeners ( eventType: TestEventType ) {
        this.#listeners
            .filter( listener => listener.type === eventType )
            .forEach( listener => listener.exec() )
    }

    addListener = ( listener: TestEventListener ) => this.#listeners.push( listener )
    removeListener = ( listener: TestEventListener ) => arrayYoink( this.#listeners, listener )

    // --- - - - - - - - ---
    //    TEST GENERATION
    // --- - - - - - - - ---

    clearTest () {
        console.debug( 'clearing test' )
        this.#writingArea.innerHTML = ''
        this.#testState = TestManager.#emptyTestState
        this.#words = []
    }

    regenerateTest ( wordCount: number ) {
        console.group( 'TestManager::regenerateTest' )

        this.toggleTestResetNotice( false )

        this.clearTest()
        const testLength = this.appendRandomWords( wordCount )

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

            total: {
                charactersWritten: {
                    correct: 0,
                    total: 0,
                },
                test: {
                    start: -1,
                    end: 0,
                    total: -1,
                    length: testLength,
                    result: null,
                },
            }
        }

        console.debug( this.#testState )

        this.highlightCurrentCharacter()
        this.#needsRegenerating = false

        this.callListeners( 'generate' )
        console.groupEnd()
    }

    appendWord ( word: WordEntity ): number {
        let html = word.toSpanArray().join( '' )
        html += `<span>&nbsp</span>`

        this.#writingArea.innerHTML += `<div class="word" id="currentTest-word-${ word.index }">${ html }</div>`
        this.#words[ word.index ] = word

        return word.length + ( word.index != 0 ? 1 : 0 )
    }

    appendRandomWords ( amount: number ): number {
        let tempLength = 0

        for ( let i = 0; i < amount; i++ )
            tempLength += this.appendWord( new WordEntity( this.#dictionary.nextWord(), i ) )

        return tempLength
    }

    // --- - - - - - - - ---
    //        TYPING
    // --- - - - - - - - ---

    getCurrentCharacterSymbol = () =>
        this.#words[ this.#testState.current.word.index ]
            .getSymbol( this.#testState.current.character.index )
        ?? 'ERROR' // top-notch error handling right there

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

        this.syncCaret( index )
    }

    syncCaret ( index: { word: number, character: number } ) {
        const unchecked = document.querySelector( `#currentTest-word-${ index.word }-letter-${ index.character }` )
        if ( !unchecked )
            throw Error( `Character with word index ${ index.word } and character index ${ index.character } doesn't exist.` )

        const span = unchecked as HTMLSpanElement

        this.#caretElement.style.width = `${ span.offsetWidth }px`
        this.#caretElement.style.left = `${ span.offsetLeft }px`
        this.#caretElement.style.top = `${ span.offsetTop + span.offsetHeight - 3 }px`
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
        if ( this.didReachWordEnd() ) return

        this.#testState.current.character.symbol = this.getCurrentCharacterSymbol()
        this.highlightCurrentCharacter()
    }

    didReachWordEnd = () =>
        this.#testState.current.character.index === this.#testState.current.word.length
        && !this.#words[ this.#testState.current.word.index ].getSymbol( this.#testState.current.character.index )

    typeCharacter ( input: string ): boolean {
        console.group( 'TestManager::typeCharacter' )

        if ( this.#needsRegenerating ) {
            console.groupEnd()
            return false
        }

        if ( this.#testState.total.test.start === -1 ) {
            this.#testState.total.test.start = Date.now()
            this.callListeners( 'start' )
        }

        this.#testState.total.charactersWritten.total++

        if ( this.#testState.current.character.symbol === input ) {
            const currentUnchecked = document.querySelector( `#currentTest-word-${ this.#testState.current.word.index }-letter-${ this.#testState.current.character.index }` )
            if ( !currentUnchecked ) {
                console.groupEnd()
                return false
            }

            const currentSpan = currentUnchecked as HTMLSpanElement
            currentSpan.setAttribute( 'data-state', 'typed' )

            this.advanceCurrentCharacter()
            this.#testState.total.charactersWritten.correct++

            if ( this.#testState.total.charactersWritten.correct === this.#testState.total.test.length )
                this.finishTest()

            console.groupEnd()
            return true
        }

        if ( input === ' ' && this.didReachWordEnd() ) {
            this.advanceCurrentWord()
            this.#testState.total.charactersWritten.correct++

            console.groupEnd()
            return true
        }

        console.groupEnd()
        return false
    }

    finishTest () {
        console.group( 'TestManager::finishTest' )
        this.#testState.total.test.end = Date.now()
        this.#testState.total.test.total = this.#testState.total.test.end - this.#testState.total.test.start
        this.#testState.total.test.result = this.#testState.total.charactersWritten.correct === this.#testState.total.test.length ? 'succeeded' : 'failed'

        this.#needsRegenerating = true

        this.callListeners( 'finish' )

        this.toggleTestResetNotice( true )
        console.groupEnd()
    }

    toggleTestResetNotice ( visible?: boolean ) {
        const resetNoticeElement = document.querySelector( '#testResetNotice' ) as HTMLDivElement
        resetNoticeElement.setAttribute( 'data-visible', typeof visible !== 'undefined' ? `${ visible }` : resetNoticeElement.getAttribute( 'data-visible' ) == 'true' ? 'false' : 'true' )
    }

    // --- - - - - - - - ---
    //       UTILITIES
    // --- - - - - - - - ---

    needsRegenerating = () => this.#needsRegenerating
    getTestLength = () => this.#testState.total.test.length
    changeDictionary = ( dictionary: Dictionary ) => this.#dictionary = dictionary
    getTestState = () => this.#testState
}
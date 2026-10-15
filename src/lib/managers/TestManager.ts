import type { Dictionary } from '../tests/dictionaries/Dictionary.ts'
import { WordEntity } from '../tests/WordEntity.ts'
import type { TestState } from '../tests/TestState.ts'
import { arrayYoink } from '../utils/arrays.ts'

// the rest of the test is filled by a single word once it's at most this long
const EXACT_FIT_LENGTH = 8
// space and letters left over for the words after, so the test never ends on a one letter word
const FOLLOWING_WORDS_RESERVE = 3

type TestEventType = 'finish' | 'start' | 'generate'
export type CaretStyle = 'underline' | 'bar' | 'block'
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
                total: -1,
                length: 0,
                result: null,
            },
        },
    }

    #dictionary: Dictionary
    #listeners: Array<TestEventListener> = []

    #caretElement: HTMLDivElement
    #caretStyle: CaretStyle = 'underline'

    // variables modified by test generation
    #writingArea: HTMLDivElement
    #testState: TestState = TestManager.#emptyTestState
    #words: Array<WordEntity> = []
    #needsRegenerating: boolean = false

    constructor(dictionary: Dictionary) {
        // find the writing area
        const areaElement = document.querySelector('#testWritingArea')
        if (!areaElement)
            throw Error('Expected HTMLDivElement from query for "#testWritingArea", got nothing instead.')

        this.#writingArea = areaElement as HTMLDivElement

        // find the caret element
        const caretElement = document.querySelector('#testCaret')
        if (!caretElement)
            throw Error('Expected HTMLDivElement from query for "#testCaret", got nothing instead.')

        this.#caretElement = caretElement as HTMLDivElement

        this.#dictionary = dictionary
        this.clearTest()

        window.addEventListener('resize', () => this.syncCaret({
            word: this.#testState.current.word.index,
            character: this.#testState.current.character.index,
        }))

        this.#writingArea.addEventListener('animationend', event => {
            const word = event.target as HTMLDivElement

            word.removeAttribute('data-error')
            word.querySelectorAll('[data-error]').forEach(letter => letter.removeAttribute('data-error'))
        })
    }

    // --- - - - - - - - ---
    //        EVENTS
    // --- - - - - - - - ---

    callListeners(eventType: TestEventType) {
        this.#listeners
            .filter(listener => listener.type === eventType)
            .forEach(listener => listener.exec())
    }

    addListener = (listener: TestEventListener) => this.#listeners.push(listener)
    removeListener = (listener: TestEventListener) => arrayYoink(this.#listeners, listener)

    // --- - - - - - - - ---
    //    TEST GENERATION
    // --- - - - - - - - ---

    clearTest() {
        this.#writingArea.innerHTML = ''
        this.#testState = TestManager.#emptyTestState
        this.#words = []
    }

    regenerateTest(characterCount: number) {
        // this.toggleTestResetNotice( false )

        this.clearTest()
        const testLength = this.appendRandomWords(characterCount)

        this.#testState = {
            current: {
                word: {
                    index: 0,
                    length: this.#words[0].length,
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

        // this.highlightCurrentCharacter()
        this.syncCaret()
        this.#needsRegenerating = false
    }

    appendWord(word: WordEntity): number {
        let html = word.toSpanArray().join('')
        html += `<span id="currentTest-word-${word.index}-letter-${word.length}" data-state="untyped">&nbsp</span>`

        this.#writingArea.innerHTML += `<div class="word" id="currentTest-word-${word.index}">${html}</div>`
        this.#words[word.index] = word

        return word.length + (word.index != 0 ? 1 : 0)
    }

    appendRandomWords(characterCount: number): number {
        let tempLength = 0

        for (let i = 0; tempLength < characterCount; i++) {
            const available = characterCount - tempLength - (i != 0 ? 1 : 0)
            const word = available <= EXACT_FIT_LENGTH
                ? this.#dictionary.nextWord({ min: available, max: available })
                : this.#dictionary.nextWord({ min: 1, max: available - FOLLOWING_WORDS_RESERVE })

            tempLength += this.appendWord(new WordEntity(word, i))
        }

        return tempLength
    }

    // --- - - - - - - - ---
    //        TYPING
    // --- - - - - - - - ---

    getCurrentCharacterSymbol = () =>
        this.#words[this.#testState.current.word.index]
            .getSymbol(this.#testState.current.character.index)
        ?? 'ERROR' // top-notch error handling right there

    highlightCurrentCharacter = () => this.highlightCharacter({
        word: this.#testState.current.word.index,
        character: this.#testState.current.character.index,
    })

    highlightCharacter(index: { word: number, character: number }) {
        const unchecked = document.querySelector(`#currentTest-word-${index.word}-letter-${index.character}`)
        if (!unchecked)
            throw Error(`Character with word index ${index.word} and character index ${index.character} doesn't exist.`)

        const span = unchecked as HTMLSpanElement
        span.setAttribute('data-state', 'highlighted')

        this.syncCaret()
    }

    syncCaret(index?: { word: number, character: number }) {
        if (!index)
            index = {
                word: this.#testState.current.word.index,
                character: this.#testState.current.character.index,
            }

        const unchecked = document.querySelector(`#currentTest-word-${index.word}-letter-${index.character}`)
        if (!unchecked)
            throw Error(`Character with word index ${index.word} and character index ${index.character} doesn't exist.`)

        const span = unchecked as HTMLSpanElement

        // a wiggling word becomes the letter's offset parent, so sum the offsets up to the caret's own
        let left = 0
        let top = 0

        for (
            let element: HTMLElement | null = span;
            element && element !== this.#caretElement.offsetParent;
            element = element.offsetParent as HTMLElement | null
        ) {
            left += element.offsetLeft
            top += element.offsetTop
        }

        const geometry = {
            underline: { left, top: top + span.offsetHeight - 3, width: span.offsetWidth, height: null },
            bar: { left: left - 2, top, width: null, height: span.offsetHeight },
            block: { left, top, width: span.offsetWidth, height: span.offsetHeight },
        }[this.#caretStyle]

        // a null size is left to the stylesheet
        this.#caretElement.style.left = `${geometry.left}px`
        this.#caretElement.style.top = `${geometry.top}px`
        this.#caretElement.style.width = geometry.width === null ? '' : `${geometry.width}px`
        this.#caretElement.style.height = geometry.height === null ? '' : `${geometry.height}px`
    }

    setCaretStyle(style: CaretStyle) {
        this.#caretStyle = style
        this.#caretElement.setAttribute('data-style', style)

        // there's no letter to sit under before the first test is generated
        if (this.#words.length) this.syncCaret()
    }

    advanceCurrentWord() {
        this.#testState.current.word.index++
        this.#testState.current.word.length = this.#words[this.#testState.current.word.index].length
        this.#testState.current.character.index = 0

        this.#testState.current.character.symbol = this.getCurrentCharacterSymbol()
        this.syncCaret()
    }

    advanceCurrentCharacter() {
        if (
            this.#testState.current.word.index === this.#words.length - 1
            && this.#testState.current.character.index === this.#testState.current.word.length - 1
        ) return // fail gracefully

        this.#testState.current.character.index++
        this.#testState.current.character.symbol = this.didReachWordEnd() ? ' ' : this.getCurrentCharacterSymbol()
        this.syncCaret()
    }

    didReachWordEnd = () =>
        this.#testState.current.character.index === this.#testState.current.word.length
        && !this.#words[this.#testState.current.word.index].getSymbol(this.#testState.current.character.index)

    typeCharacter(input: string): boolean {
        if (this.#needsRegenerating) {
            return false
        }

        if (this.#testState.total.test.start === -1) {
            this.#testState.total.test.start = Date.now()
            this.callListeners('start')
        }

        this.#testState.total.charactersWritten.total++

        if (input === ' ' && this.didReachWordEnd()) {
            this.advanceCurrentWord()
            this.#testState.total.charactersWritten.correct++

            return true
        }

        if (this.#testState.current.character.symbol === input) {
            const currentUnchecked = document.querySelector(`#currentTest-word-${this.#testState.current.word.index}-letter-${this.#testState.current.character.index}`)
            if (!currentUnchecked) {
                return false
            }

            const currentSpan = currentUnchecked as HTMLSpanElement
            currentSpan.setAttribute('data-state', 'typed')

            this.advanceCurrentCharacter()
            this.#testState.total.charactersWritten.correct++

            if (this.#testState.total.charactersWritten.correct === this.#testState.total.test.length)
                this.finishTest(false)

            return true
        }

        this.indicateError()
        return false
    }

    indicateError() {
        const { word, character } = this.#testState.current
        const wordElement = document.querySelector(`#currentTest-word-${word.index}`) as HTMLDivElement

        // restart the wiggle when it's still playing
        wordElement.removeAttribute('data-error')
        void wordElement.offsetWidth
        wordElement.setAttribute('data-error', 'true')

        document.querySelector(`#currentTest-word-${word.index}-letter-${character.index}`)
            ?.setAttribute('data-error', 'true')
    }

    finishTest(silent: boolean) {
        this.#testState.total.test.end = Date.now()
        this.#testState.total.test.total = this.#testState.total.test.end - this.#testState.total.test.start
        this.#testState.total.test.result = this.#testState.total.charactersWritten.correct === this.#testState.total.test.length ? 'succeeded' : 'failed'

        this.#needsRegenerating = true

        if (!silent) this.callListeners('finish')

        // this.toggleTestResetNotice( true )
    }

    setTestVisible = (visible: boolean) => document.querySelector('#currentTest')!.setAttribute('data-testVisible', `${visible}`)

    // --- - - - - - - - ---
    //       UTILITIES
    // --- - - - - - - - ---

    needsRegenerating = () => this.#needsRegenerating
    // started and not finished yet
    isRunning = () => this.#testState.total.test.start !== -1 && !this.#needsRegenerating
    getTestLength = () => this.#testState.total.test.length
    changeDictionary = (dictionary: Dictionary) => this.#dictionary = dictionary
    getTestState = () => this.#testState
}
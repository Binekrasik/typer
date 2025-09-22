import { type TestDifficulty, TestDifficultyEntries } from '../tests/TestDifficultyEntries.ts'
import { DifficultyEntity } from '../tests/DifficultyEntity.ts'
import type { ScoreManager } from './ScoreManager.ts'
import { sounds } from '../audio/sounds.ts'

export class DifficultySelectionManager {
    #selectedDifficulty: TestDifficulty = TestDifficultyEntries.average
    #selectedDifficultyElement: HTMLAnchorElement | null = null
    #testOptionsElement: HTMLDivElement
    #difficultySelectionElement: HTMLDivElement
    #difficulties: Array< TestDifficulty > = []
    #selectedDifficultyIndex: number = 0
    #scoreManager: ScoreManager
    #locked: boolean = false

    constructor ( scoreManager: ScoreManager ) {
        const unverifiedSelection = document.querySelector( '#testDifficultySelection' )
        if ( !unverifiedSelection )
            throw Error( 'Couldn\'t find the difficulty selection element.' )

        const unverifiedOptions = document.querySelector( '#testOptions' )
        if ( !unverifiedOptions )
            throw Error( 'Couldn\'t find the test options element.' )

        this.#scoreManager = scoreManager

        this.#difficultySelectionElement = unverifiedSelection as HTMLDivElement
        this.#testOptionsElement = unverifiedOptions as HTMLDivElement

        this.updateDifficultySelection()
        this.selectDifficulty( this.#difficulties.indexOf( this.#selectedDifficulty ), false )

        window.addEventListener( 'resize', () => this.syncDifficultyIndicator() )
    }

    updateDifficultySelection () {
        this.#difficultySelectionElement.replaceChildren()
        this.#difficulties = []
        let html = ''

        // preprocess the entries
        for ( let entry in TestDifficultyEntries ) {
            this.#difficulties.push( TestDifficultyEntries[ entry ] )
        }

        // populate the difficulty selector
        this.#difficulties.forEach( ( entry, index ) => {
            const difficulty = new DifficultyEntity( entry, index )

            html += difficulty.toHtml()
        })

        this.#difficultySelectionElement.innerHTML = html

        // add event listeners
        this.#difficulties.forEach( ( _, index ) => {
            const element = document.querySelector( `#difficultyOption-${ index }` ) as HTMLAnchorElement

            element.addEventListener( 'click', () => {
                this.selectDifficulty( index )
            })
        })
    }

    syncDifficultyIndicator () {
        const indicatorElement = document.querySelector( '#difficultyOptionIndicator' ) as HTMLDivElement

        if ( !this.#selectedDifficultyElement || !indicatorElement )
            return

        indicatorElement.style.left = `${ this.#selectedDifficultyElement.offsetLeft - 13 }px`
        indicatorElement.style.top = `${ this.#selectedDifficultyElement.offsetTop - 4 }px`
        indicatorElement.style.width = `${ this.#selectedDifficultyElement.clientWidth + 26 }px`
        indicatorElement.style.height = `${ this.#selectedDifficultyElement.clientHeight + 8 }px`
    }

    selectDifficulty ( index: number, playSound?: boolean ) {
        if ( this.#locked ) return

        console.debug( `changing difficulty to ${ index }` )
        this.#selectedDifficultyIndex = index
        this.updateDifficultySelection()
        this.#selectedDifficulty = this.#difficulties[ index ]

        const unverifiedElement = document.querySelector( `#difficultyOption-${ index }` )
        if ( !unverifiedElement )
            throw Error( `Couldn't find a HTML element for the index ${ index }.` )

        const element = unverifiedElement as HTMLAnchorElement
        element.setAttribute( 'data-selected', 'true' )

        if ( this.#selectedDifficultyElement )
            this.#selectedDifficultyElement.setAttribute( 'data-selected', 'false' )

        this.#selectedDifficultyElement = element

        this.#scoreManager.setDifficulty( this.#selectedDifficulty )
        this.syncDifficultyIndicator()

        if ( playSound !== false )
            sounds.select.play()
    }

    cycleSelectedDifficulty ( direction: 'previous' | 'next' ) {
        if ( direction === 'previous' ) {
            this.selectDifficulty( this.#selectedDifficultyIndex - 1 === -1 ? this.#difficulties.length - 1 : this.#selectedDifficultyIndex - 1 )
        } else this.selectDifficulty( this.#selectedDifficultyIndex + 1 === this.#difficulties.length ? 0 : this.#selectedDifficultyIndex + 1 )
    }

    lockSelection = () => {
        this.#locked = true
        this.#testOptionsElement.setAttribute( 'data-locked', 'true' )
    }
    unlockSelection = () => {
        this.#locked = false
        this.#testOptionsElement.setAttribute( 'data-locked', 'false' )
    }
}
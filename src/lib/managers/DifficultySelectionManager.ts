import { type TestDifficulty, TestDifficultyEntries } from '../tests/TestDifficultyEntries.ts'
import { DifficultyEntity } from '../tests/DifficultyEntity.ts'
import type { ScoreManager } from './ScoreManager.ts'

export class DifficultySelectionManager {
    #selectedDifficulty: TestDifficulty = TestDifficultyEntries.average
    #selectedDifficultyElement: HTMLAnchorElement | null = null
    #difficultySelectionElement: HTMLDivElement
    #difficulties: Array< TestDifficulty > = []
    #selectedDifficultyIndex: number = 0
    #scoreManager: ScoreManager

    constructor ( scoreManager: ScoreManager ) {
        const unverifiedSelection = document.querySelector( '#testDifficultySelection' )
        if ( !unverifiedSelection )
            throw Error( 'Couldn\'t find the difficulty selection element.' )

        this.#scoreManager = scoreManager

        this.#difficultySelectionElement = unverifiedSelection as HTMLDivElement
        this.updateDifficultySelection()
        this.selectDifficulty( this.#difficulties.indexOf( this.#selectedDifficulty ) )
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

    selectDifficulty ( index: number ) {
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

        this.#scoreManager.setDifficulty( this.#selectedDifficulty )
    }

    cycleSelectedDifficulty ( direction: 'previous' | 'next' ) {
        if ( direction === 'previous' ) {
            this.selectDifficulty( this.#selectedDifficultyIndex - 1 === -1 ? this.#difficulties.length - 1 : this.#selectedDifficultyIndex - 1 )
        } else this.selectDifficulty( this.#selectedDifficultyIndex + 1 === this.#difficulties.length ? 0 : this.#selectedDifficultyIndex + 1 )
    }
}
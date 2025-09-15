import { type TestDifficulty, TestDifficultyEntries } from '../tests/TestDifficultyEntries.ts'
import { DifficultyEntity } from '../tests/DifficultyEntity.ts'
import type { ScoreManager } from './ScoreManager.ts'

export class DifficultySelectionManager {
    #selectedDifficulty: TestDifficulty = TestDifficultyEntries.average
    #selectedDifficultyElement: HTMLAnchorElement | null = null
    #difficultySelectionElement: HTMLDivElement
    #scoreManager: ScoreManager

    constructor ( scoreManager: ScoreManager ) {
        const unverifiedSelection = document.querySelector( '#testDifficultySelection' )
        if ( !unverifiedSelection )
            throw Error( 'Couldn\'t find the difficulty selection element.' )

        this.#scoreManager = scoreManager

        this.#difficultySelectionElement = unverifiedSelection as HTMLDivElement
        this.updateDifficultySelection()
        this.selectDifficulty( this.#selectedDifficulty )
    }

    updateDifficultySelection () {
        let html = ''

        for ( let entry in TestDifficultyEntries ) {
            const difficulty = new DifficultyEntity( TestDifficultyEntries[ entry ] )
            html += difficulty.toHtml()
        }

        this.#difficultySelectionElement.innerHTML = html

        for ( let entry in TestDifficultyEntries ) {
            const element = document.querySelector( `#difficultyOption-${ TestDifficultyEntries[ entry ].id }` ) as HTMLAnchorElement

            element.addEventListener( 'click', () => {
                this.selectDifficulty( TestDifficultyEntries[ entry ] )
            })
        }
    }

    selectDifficulty ( difficulty: TestDifficulty ) {
        this.updateDifficultySelection()
        this.#selectedDifficulty = difficulty

        const unverifiedElement = document.querySelector( `#difficultyOption-${ difficulty.id }` )
        if ( !unverifiedElement )
            throw Error( `Couldn't find a HTML element for difficulty id ${ difficulty.id }.` )

        const element = unverifiedElement as HTMLAnchorElement
        element.setAttribute( 'data-selected', 'true' )

        if ( this.#selectedDifficultyElement )
            this.#selectedDifficultyElement.setAttribute( 'data-selected', 'false' )

        this.#scoreManager.setDifficulty( difficulty )
    }
}
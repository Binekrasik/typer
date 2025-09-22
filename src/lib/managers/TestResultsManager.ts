import {
    type TestRankDisplayProperties,
    TestRanks,
    type TestResults,
} from '../tests/results/TestResults.ts'

export class TestResultsManager {
    #resultsOverlayElement: HTMLDivElement

    constructor () {
        const uncheckedResultsElement = document.querySelector( '#testResultsOverlay' )
        if ( !uncheckedResultsElement )
            throw Error( 'Test results element does not exist.' )

        this.#resultsOverlayElement = uncheckedResultsElement as HTMLDivElement
    }

    showResults ( results: TestResults ) {
        console.debug( 'showing results' )

        const rank = document.querySelector( '#testResultsOverlay .rank' ) as HTMLHeadingElement
        const rating = document.querySelector( '#testResultsOverlay .rating' ) as HTMLHeadingElement

        rank.innerText = results.rank.name
        rank.style.color = `${ results.rank.color }`

        rating.innerText = `${ results.rating } per cent`

        this.#resultsOverlayElement.setAttribute( 'data-visible', 'true' )
    }

    hideResults = () => this.#resultsOverlayElement.setAttribute( 'data-visible', 'false' )

    static getRank ( rating: number ): TestRankDisplayProperties {
        if ( rating >= 99 ) return TestRanks.ss
        if ( rating > 95 ) return TestRanks.s
        if ( rating > 85 ) return TestRanks.a
        if ( rating > 70 ) return TestRanks.b
        if ( rating > 50 ) return TestRanks.c
        if ( rating > 0 ) return TestRanks.d

        // basically 0% rating
        return TestRanks.f
    }
}
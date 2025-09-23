import {
    type TestRankDisplayProperties,
    TestRanks,
    type TestResults,
} from '../tests/results/TestResults.ts'
import type { TestManager } from './TestManager.ts'

export class TestResultsManager {
    #resultsOverlayElement: HTMLDivElement
    #numberAnimator: number = -1

    constructor ( testManager: TestManager ) {
        const uncheckedResultsElement = document.querySelector( '#testResultsOverlay' )
        if ( !uncheckedResultsElement )
            throw Error( 'Test results element does not exist.' )

        this.#resultsOverlayElement = uncheckedResultsElement as HTMLDivElement
    }

    showResults ( results: TestResults ) {
        console.debug( 'showing results' )

        const rank = document.querySelector( '#testResultsOverlay .rank' ) as HTMLHeadingElement
        const difficulty = document.querySelector( '#testResultsOverlay .difficulty span' ) as HTMLSpanElement

        const ratingPercentage = document.querySelector( '#testResultsOverlay .achievedProgressBox p span' ) as HTMLSpanElement
        const progressBox = document.querySelector( '#testResultsOverlay .achievedProgressBox' ) as HTMLDivElement

        const rankBars = {
            ss: document.querySelector( '#testResultsOverlay .progressRankingBar .rankSS' ) as HTMLDivElement,
            s: document.querySelector( '#testResultsOverlay .progressRankingBar .rankS' ) as HTMLDivElement,
            a: document.querySelector( '#testResultsOverlay .progressRankingBar .rankA' ) as HTMLDivElement,
            b: document.querySelector( '#testResultsOverlay .progressRankingBar .rankB' ) as HTMLDivElement,
            c: document.querySelector( '#testResultsOverlay .progressRankingBar .rankC' ) as HTMLDivElement,
            d: document.querySelector( '#testResultsOverlay .progressRankingBar .rankD' ) as HTMLDivElement,
        }

        const statsTexts = {
            speed: document.querySelector( '#testResultsSpeedText span' ) as HTMLSpanElement,
            accuracy: document.querySelector( '#testResultsAccuracyText span' ) as HTMLSpanElement,
            duration: document.querySelector( '#testResultsDurationText span' ) as HTMLSpanElement,
            length: document.querySelector( '#testResultsLengthText span' ) as HTMLSpanElement,
            difficulty: document.querySelector( '#testResultsDifficultyText span' ) as HTMLSpanElement,
        }

        const username = document.querySelector( '#testResultsUsernameText span' ) as HTMLSpanElement

        // set values

        this.#resultsOverlayElement.style.cssText = `--ranking-color: ${ results.rank.color };`

        rank.innerText = results.rank.name


        progressBox.style.width = `calc( ${ results.rating } / 100 * 15vw )`

        this.#numberAnimator = setInterval( () => {
            ratingPercentage.innerText = `${ Math.round( progressBox.offsetWidth / ( 0.15 * window.innerWidth ) * 100 ) }`
        }, 1 )

        setTimeout( () => clearInterval( this.#numberAnimator ), 5000 )

        // todo: allow for dynamic changes of rank ratings
        rankBars.ss.style.width = '1%'
        rankBars.s.style.width = '4%'
        rankBars.a.style.width = '10%'
        rankBars.b.style.width = '15%'
        rankBars.c.style.width = '20%'
        rankBars.d.style.width = '50%'

        rankBars.ss.style.background = TestRanks.ss.color
        rankBars.s.style.background = TestRanks.s.color
        rankBars.a.style.background = TestRanks.a.color
        rankBars.b.style.background = TestRanks.b.color
        rankBars.c.style.background = TestRanks.c.color
        rankBars.d.style.background = TestRanks.d.color

        statsTexts.speed.innerText = `${ results.speed }`
        statsTexts.accuracy.innerText = `${ results.accuracy }`
        statsTexts.duration.innerText = `${ results.duration }`
        statsTexts.length.innerText = `${ results.length }`
        statsTexts.difficulty.innerText = results.difficulty.name

        username.innerText = results.username

        this.#resultsOverlayElement.setAttribute( 'data-visible', 'true' )
    }

    hideResults () {
        this.#resultsOverlayElement.setAttribute( 'data-visible', 'false' )
        clearInterval( this.#numberAnimator )
    }

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
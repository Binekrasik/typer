import {
    type TestRankDisplayProperties,
    TestRanks,
    type TestResults,
} from '../tests/results/TestResults.ts'
import { type SoundType, sounds } from '../audio/sounds.ts'

const rankSoundThresholds: ReadonlyArray<[number, SoundType]> = [
    [1, 'score_d'],
    [50, 'score_c'],
    [70, 'score_b'],
    [85, 'score_a'],
    [95, 'score_s'],
    [100, 'score_ss'],
]

const ratingAnimationDuration = 4000

export class TestResultsManager {
    #resultsOverlayElement: HTMLDivElement
    #numberAnimator: number = -1

    constructor() {
        const uncheckedResultsElement = document.querySelector('#testResultsOverlay')
        if (!uncheckedResultsElement)
            throw Error('Test results element does not exist.')

        this.#resultsOverlayElement = uncheckedResultsElement as HTMLDivElement
    }

    clearResults() {
        (document.querySelector('#testResultsOverlay .achievedProgressBox') as HTMLDivElement).style.width = '0%'
        document.querySelectorAll('#testResultsOverlay .progressRankingBar div').forEach(entry => {
            const element = entry as HTMLDivElement
            element.style.width = '0%'
        })
    }

    showResults(results: TestResults) {
        console.debug('showing results')

        const rank = document.querySelector('#testResultsOverlay .rank') as HTMLHeadingElement
        const comment = document.querySelector('#testResultsOverlay .comment span') as HTMLSpanElement

        const ratingPercentage = document.querySelector('#testResultsOverlay .achievedProgressBox p span') as HTMLSpanElement
        const progressBox = document.querySelector('#testResultsOverlay .achievedProgressBox') as HTMLDivElement

        const rankBars = {
            ss: document.querySelector('#testResultsOverlay .progressRankingBar .rankSS') as HTMLDivElement,
            s: document.querySelector('#testResultsOverlay .progressRankingBar .rankS') as HTMLDivElement,
            a: document.querySelector('#testResultsOverlay .progressRankingBar .rankA') as HTMLDivElement,
            b: document.querySelector('#testResultsOverlay .progressRankingBar .rankB') as HTMLDivElement,
            c: document.querySelector('#testResultsOverlay .progressRankingBar .rankC') as HTMLDivElement,
            d: document.querySelector('#testResultsOverlay .progressRankingBar .rankD') as HTMLDivElement,
        }

        const statsTexts = {
            speed: document.querySelector('#testResultsSpeedText span') as HTMLSpanElement,
            accuracy: document.querySelector('#testResultsAccuracyText span') as HTMLSpanElement,
            duration: document.querySelector('#testResultsDurationText span') as HTMLSpanElement,
            length: document.querySelector('#testResultsLengthText span') as HTMLSpanElement,
            difficulty: document.querySelector('#testResultsDifficultyText span') as HTMLSpanElement,
        }

        const username = document.querySelector('#testResultsUsernameText span') as HTMLSpanElement

        // set the values
        this.#resultsOverlayElement.style.cssText = `--ranking-color: ${results.rank.color};`

        comment.innerText = results.rank.comments[Math.round(Math.random() * (results.rank.comments.length - 1))]

        rank.innerText = results.rank.name
        progressBox.style.width = `calc( ${results.rating} / 100 * 15vw )`

        cancelAnimationFrame(this.#numberAnimator)

        let animationStart: number | undefined
        let displayedRating = parseInt(ratingPercentage.innerText)
        let reachedRanks = 0

        const animateRating = (timestamp: number) => {
            animationStart ??= timestamp

            const computed = Math.ceil(progressBox.offsetWidth / (0.15 * window.innerWidth) * 100)
            if (computed != displayedRating) {
                sounds.score.play()
                ratingPercentage.innerText = `${computed}`
                displayedRating = computed
            }

            const previouslyReachedRanks = reachedRanks
            while (reachedRanks < rankSoundThresholds.length && computed >= rankSoundThresholds[reachedRanks][0])
                reachedRanks++

            // only the highest rank crossed this frame gets its sound, so skipped frames don't stack sounds
            if (reachedRanks > previouslyReachedRanks)
                sounds[rankSoundThresholds[reachedRanks - 1][1]].play()

            if (timestamp - animationStart < ratingAnimationDuration)
                this.#numberAnimator = requestAnimationFrame(animateRating)
        }

        this.#numberAnimator = requestAnimationFrame(animateRating)

        // todo: allow for dynamic changes of rank ratings
        rankBars.ss.style.width = '1%'
        rankBars.ss.style.background = TestRanks.ss.color
        rankBars.s.style.width = '4%'
        rankBars.s.style.background = TestRanks.s.color
        rankBars.a.style.width = '10%'
        rankBars.a.style.background = TestRanks.a.color
        rankBars.b.style.width = '15%'
        rankBars.b.style.background = TestRanks.b.color
        rankBars.c.style.width = '20%'
        rankBars.c.style.background = TestRanks.c.color
        rankBars.d.style.width = '50%'
        rankBars.d.style.background = TestRanks.d.color

        statsTexts.speed.innerText = `${results.speed}`
        statsTexts.accuracy.innerText = `${results.accuracy}`
        statsTexts.duration.innerText = `${results.duration}`
        statsTexts.length.innerText = `${results.length}`
        statsTexts.difficulty.innerText = results.difficulty.name

        username.innerText = results.username

        this.#resultsOverlayElement.setAttribute('data-visible', 'true')
    }

    hideResults() {
        this.#resultsOverlayElement.setAttribute('data-visible', 'false')
        this.clearResults()

        cancelAnimationFrame(this.#numberAnimator)
    }

    static getRank(rating: number): TestRankDisplayProperties {
        if (rating >= 99) return TestRanks.ss
        if (rating > 95) return TestRanks.s
        if (rating > 85) return TestRanks.a
        if (rating > 70) return TestRanks.b
        if (rating > 50) return TestRanks.c
        if (rating > 0) return TestRanks.d

        // basically 0% rating
        return TestRanks.f
    }
}
import {
    type TestRankDisplayProperties,
    TestRanks,
    type TestResults,
} from '../tests/results/TestResults.ts'
import { type SoundType, sounds } from '../audio/sounds.ts'

// ordered from the left of the ranking bar, a segment pops and plays its sound once the rating reaches its threshold
const rankSegments: ReadonlyArray<{ rank: string, width: number, threshold: number, sound: SoundType }> = [
    { rank: 'd', width: 50, threshold: 1, sound: 'score_d' },
    { rank: 'c', width: 20, threshold: 50, sound: 'score_c' },
    { rank: 'b', width: 15, threshold: 70, sound: 'score_b' },
    { rank: 'a', width: 10, threshold: 85, sound: 'score_a' },
    { rank: 's', width: 4, threshold: 95, sound: 'score_s' },
    { rank: 'ss', width: 1, threshold: 100, sound: 'score_ss' },
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
            element.removeAttribute('data-reached')
        })
    }

    showResults(results: TestResults) {
        console.debug('showing results')

        const rank = document.querySelector('#testResultsOverlay .rank') as HTMLHeadingElement
        const comment = document.querySelector('#testResultsOverlay .comment span') as HTMLSpanElement

        const ratingPercentage = document.querySelector('#testResultsOverlay .achievedProgressBox p span') as HTMLSpanElement
        const progressBox = document.querySelector('#testResultsOverlay .achievedProgressBox') as HTMLDivElement

        const rankBars = rankSegments.map(segment =>
            document.querySelector(`#testResultsOverlay .progressRankingBar .rank${segment.rank.toUpperCase()}`) as HTMLDivElement,
        )

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

            // measured in subpixels and capped, so it lands exactly on the rating at any window width
            const computed = Math.min(Math.round(progressBox.getBoundingClientRect().width / (0.15 * window.innerWidth) * 100), results.rating)
            if (computed != displayedRating) {
                sounds.score.play()
                ratingPercentage.innerText = `${computed}`
                displayedRating = computed
            }

            const previouslyReachedRanks = reachedRanks
            while (reachedRanks < rankSegments.length && computed >= rankSegments[reachedRanks].threshold) {
                rankBars[reachedRanks].setAttribute('data-reached', 'true')
                reachedRanks++
            }

            // only the highest rank crossed this frame gets its sound, so skipped frames don't stack sounds
            if (reachedRanks > previouslyReachedRanks)
                sounds[rankSegments[reachedRanks - 1].sound].play()

            if (timestamp - animationStart < ratingAnimationDuration)
                this.#numberAnimator = requestAnimationFrame(animateRating)
        }

        this.#numberAnimator = requestAnimationFrame(animateRating)

        // todo: allow for dynamic changes of rank ratings
        rankSegments.forEach((segment, index) => {
            rankBars[index].style.width = `${segment.width}%`
            rankBars[index].style.setProperty('--rank-color', TestRanks[segment.rank].color)
        })

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
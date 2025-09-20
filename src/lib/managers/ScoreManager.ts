import type { ProgressBarManager } from './ProgressBarManager.ts'
import { TestDifficultyEntries, type TestDifficulty } from '../tests/TestDifficultyEntries.ts'
import { Debug } from '../utils/Debug.ts'

export class ScoreManager {
    #progressManager: ProgressBarManager

    #lastTypedTimestamp: number = 0
    #penalizer: number = -1 // penalization interval id
    #difficulty: TestDifficulty = TestDifficultyEntries.average!

    constructor ( progressManager: ProgressBarManager, difficulty: TestDifficulty ) {
        this.#progressManager = progressManager
        this.setDifficulty( difficulty )
    }

    getDifficulty = () => this.#difficulty

    setDifficulty ( difficulty: TestDifficulty ) {
        this.#difficulty = difficulty
        this.debugScoreProperties()
    }

    getIncorrectCharacterPenalty = () => this.#difficulty.incorrectCharacterPenalty

    debugScoreProperties () {
        Debug.setContent(`
            <p>difficulty: ${ this.#difficulty.name }</p>
            <p>max delta: ${ this.#difficulty.maxDelta } (~${ ( 1000 / this.#difficulty.maxDelta * 60 ) / 5 } wpm)</p>
            <p>interval: ${ this.#difficulty.penalizationIntervalDelay }</p>
            <p>incorrect penalty: ${ this.getIncorrectCharacterPenalty() }</p>
            <p>reward multiplier: ${ this.getRewardValue( 100 ) }</p>
            <p>minimum timeout penalty (${ this.#difficulty.maxDelta }): ${ this.calculatePenalty( this.#difficulty.maxDelta ) }</p>
        `)
    }

    startPenalizer () {
        this.updateLastTypedTimestamp()

        this.#penalizer = setInterval( () => {
            if ( this.getDeltaTyped() > this.#difficulty.maxDelta && this.#progressManager.getValue() !== 0 ) {
                this.penalize( this.calculatePenalty() )
            }

        }, this.#difficulty.penalizationIntervalDelay )
    }

    stopPenalizer () {
        clearInterval( this.#penalizer )
    }

    penalize ( penalty: number ) {
        this.#progressManager.decreaseValue( penalty )
    }

    getDeltaTyped = () => Date.now() - this.#lastTypedTimestamp

    calculatePenalty ( deltaTyped?: number ) {
        let penalty = this.#difficulty.penaltyMultiplier * ( deltaTyped ? deltaTyped : this.getDeltaTyped() / 50 )
        penalty = penalty < 0.1 ? 0.1 : penalty
        return penalty
    }

    updateLastTypedTimestamp = () => this.#lastTypedTimestamp = Date.now()
    getRewardValue = ( maxProgressValue: number ) => this.#difficulty.rewardMultiplier * maxProgressValue * 0.01
}
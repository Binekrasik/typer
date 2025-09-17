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
            <p></p>
            <p>difficulty: ${ this.#difficulty.name }</p><br>
            <p>max delta: ${ this.#difficulty.maxDelta } (~${ ( 1000 / this.#difficulty.maxDelta * 60 ) / 5 } wpm)</p><br>
            <p>interval: ${ this.#difficulty.penalizationIntervalDelay }</p><br>
            <p>incorrect penalty: ${ this.getIncorrectCharacterPenalty() }</p><br>
            <p>reward multiplier: ${ this.getRewardValue( 100 ) }</p><br>
            <p>minimum timeout penalty (${ this.#difficulty.maxDelta }): ${ this.calculatePenalty( this.#difficulty.maxDelta ) }</p><br>
        `)
    }

    startPenalizer () {
        this.updateLastTypedTimestamp()

        console.group( 'Score properties' )
        console.debug( `difficulty: ${ this.#difficulty }` )
        console.debug( `max delta: ${ this.#difficulty.maxDelta } (~${ ( 1000 / this.#difficulty.maxDelta * 60 ) / 5 } wpm)` )
        console.debug( `interval: ${ this.#difficulty.penalizationIntervalDelay }` )
        console.debug( `incorrect penalty: ${ this.getIncorrectCharacterPenalty() }` )
        console.debug( `penalty (${ this.#difficulty.maxDelta }): ${ this.calculatePenalty( this.#difficulty.maxDelta ) }` )
        console.groupEnd()

        this.#penalizer = setInterval( () => {
            if ( this.getDeltaTyped() > this.#difficulty.maxDelta && this.#progressManager.getValue() !== 0 ) {
                this.penalize( this.calculatePenalty() )
            }

        }, this.#difficulty.penalizationIntervalDelay )

        console.debug( `started penalizer: ${ this.#penalizer }` )
    }

    stopPenalizer () {
        clearInterval( this.#penalizer )
        console.debug( `cleared penalizer: ${ this.#penalizer }` )
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
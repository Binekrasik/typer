import './styles/app.scss'

import { ProgressBarManager } from './lib/managers/ProgressBarManager.ts'
import { InputManager } from './lib/managers/InputManager.ts'
import { TestManager } from './lib/managers/TestManager.ts'
import { arrayIncludesAny } from './lib/utils/arrays.ts'
import { ScoreManager } from './lib/managers/ScoreManager.ts'
import { TestDifficultyEntries } from './lib/tests/TestDifficultyEntries.ts'
import { Debug } from './lib/utils/Debug.ts'
import { DifficultySelectionManager } from './lib/managers/DifficultySelectionManager.ts'
import { SettingsManager } from './lib/managers/SettingsManager.ts'

/*
 * I LOVE HUGE CODE MONOLITHS!!!
 * todo: rewrite this shit
 */

let testsCount = 0

const settingsManager = new SettingsManager()
const progressManager = new ProgressBarManager()
const inputManager = new InputManager()
const testManager = new TestManager( settingsManager )
const scoreManager = new ScoreManager( progressManager, TestDifficultyEntries.average )
const difficultySelectionManager = new DifficultySelectionManager( scoreManager )

const wordCount = settingsManager.get( 'wordCount' ).value

const removeLoadingOverlay = () => {
    const loadingOverlay = document.querySelector( '#loaderOverlay' ) as HTMLDivElement
    loadingOverlay.setAttribute( 'data-loading', 'false' )
}

const resetTest = () => {
    console.debug( 'resetting test' )

    scoreManager.stopPenalizer()
    testManager.regenerateTest( wordCount )
    progressManager.reset()
    progressManager.setMaxValue( testManager.getTestLength() )
    difficultySelectionManager.syncDifficultyIndicator()

    removeLoadingOverlay()

    scoreManager.debugScoreProperties()
}

// initialize test
window.onload = () => {
    resetTest()
}

inputManager.addListener( 'character', character => {
    if ( testManager.needsRegenerating() ) return

    if ( testManager.typeCharacter( character ) ) {
        scoreManager.updateLastTypedTimestamp()
        progressManager.increaseValue( scoreManager.getRewardValue( progressManager.getMaxValue() ) )
    } else progressManager.decreaseValue( scoreManager.getIncorrectCharacterPenalty() )
})

inputManager.addListener( 'meta', key => {
    if (
        key === 'Backspace'
        && arrayIncludesAny( inputManager.activeModifierKeys, [ 'ControlLeft', 'ControlRight' ] )
        && arrayIncludesAny( inputManager.activeModifierKeys, [ 'ShiftLeft', 'ShiftRight' ] )
    ) resetTest()

    if ( key === 'Tab' )
        if ( arrayIncludesAny( inputManager.activeModifierKeys, [ 'ShiftLeft', 'ShiftRight' ] ) ) {
            difficultySelectionManager.cycleSelectedDifficulty( 'previous' )
        } else difficultySelectionManager.cycleSelectedDifficulty( 'next' )
})

progressManager.addListener({
    type: 'valueChange',
    exec: () => {
        if ( progressManager.getValue() === 0 && testManager.getTestState().total.test.start !== -1 )
            testManager.finishTest()
    }
})

testManager.addListener({
    type: 'generate',
    exec: () => {
        difficultySelectionManager.syncDifficultyIndicator()
    }
})

testManager.addListener({
    type: 'start',
    exec: () => {
        progressManager.setValue( progressManager.getMaxValue() )
        scoreManager.startPenalizer()
    }
})

testManager.addListener({
    type: 'finish',
    exec: () => {
        testsCount++
        const state = testManager.getTestState()

        scoreManager.stopPenalizer()

        Debug.setContent(`
            <p style="color: ${ state.total.test.result === 'succeeded' ? '#0f0' : '#f00' }">test ${ state.total.test.result }</p>
            <p>test this session: ${ testsCount }</p>
            <p>difficulty: ${ scoreManager.getDifficulty().name }</p>
            <p>test duration: ${ state.total.test.total / 1000 }s</p>
            <p>total characters: ${ state.total.charactersWritten.total }</p>
            <p>correct characters: ${ state.total.charactersWritten.correct }</p>
            <p>rating: ${ Math.round( progressManager.getPercentageValue() ) }%</p>
        `)
    }
})
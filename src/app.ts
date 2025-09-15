import './styles/app.scss'

import { ProgressBarManager } from './lib/managers/ProgressBarManager.ts'
import { InputManager } from './lib/managers/InputManager.ts'
import { TestManager } from './lib/managers/TestManager.ts'
import { arrayIncludesAny } from './lib/utils/arrays.ts'
import { ScoreManager } from './lib/managers/ScoreManager.ts'
import { TestDifficultyEntries } from './lib/tests/TestDifficultyEntries.ts'
import { Debug } from './lib/utils/Debug.ts'
import { DifficultySelectionManager } from './lib/managers/DifficultySelectionManager.ts'

let testsCount = 0

const progressManager = new ProgressBarManager()
const inputManager = new InputManager()
const testManager = new TestManager()
const scoreManager = new ScoreManager( progressManager, TestDifficultyEntries.average )
new DifficultySelectionManager( scoreManager )

const wordCount = 5

const resetTest = () => {
    console.debug( 'resetting test' )

    scoreManager.stopPenalizer()
    testManager.regenerateTest( wordCount )
    progressManager.reset()
    progressManager.setMaxValue( testManager.getTestLength() )

    scoreManager.debugScoreProperties()
}

// initialize test
console.group( 'Test initialization' )
resetTest()
console.groupEnd()

inputManager.addListener( 'character', character => {
    if ( testManager.needsRegenerating() ) return
    console.debug( `delta typed: ${ scoreManager.getDeltaTyped() }` )

    if ( testManager.typeCharacter( character ) ) {
        scoreManager.updateLastTypedTimestamp()
        progressManager.increaseValue( 1 )
    } else progressManager.decreaseValue( scoreManager.getIncorrectCharacterPenalty() )
})

inputManager.addListener( 'meta', key => {
    if (
        key === 'Backspace'
        && arrayIncludesAny( inputManager.activeModifierKeys, [ 'ControlLeft', 'ControlRight' ] )
        && arrayIncludesAny( inputManager.activeModifierKeys, [ 'ShiftLeft', 'ShiftRight' ] )
    ) resetTest()
})

progressManager.addListener({
    type: 'valueChange',
    exec: () => {
        console.group( 'app.ts valueChangeListener' )
        if ( progressManager.getValue() === 0 && testManager.getTestState().total.test.start !== -1 )
            testManager.finishTest()

        console.groupEnd()
    }
})

testManager.addListener({
    type: 'generate',
    exec: () => {
        console.log( 'new test generated' )
        console.log( `needs regenerating: ${ testManager.needsRegenerating() }` )
    }
})

testManager.addListener({
    type: 'start',
    exec: () => {
        console.group( 'app.ts startListener' )
        progressManager.setValue( progressManager.getMaxValue() )
        scoreManager.startPenalizer()

        console.log( 'test started' )
        console.groupEnd()
    }
})

testManager.addListener({
    type: 'finish',
    exec: () => {
        console.group( 'app.ts finishListener' )
        testsCount++
        const state = testManager.getTestState()

        scoreManager.stopPenalizer()
        console.log( 'test finished' )

        Debug.setContent(`
            <p style="color: ${ state.total.test.result === 'succeeded' ? '#0f0' : '#f00' }">test ${ state.total.test.result }</p>
            <p>test this session: ${ testsCount }</p>
            <p>difficulty: ${ scoreManager.getDifficulty().name }</p>
            <p>test duration: ${ state.total.test.total / 1000 }s</p><br>
            <p>total characters: ${ state.total.charactersWritten.total }</p><br>
            <p>correct characters: ${ state.total.charactersWritten.correct }</p><br>
            <p>rating: ${ Math.round( progressManager.getPercentageValue() ) }%</p><br>
        `)
        console.groupEnd()
    }
})
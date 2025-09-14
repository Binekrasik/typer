import './styles/app.scss'
import { ProgressBarManager } from './lib/managers/ProgressBarManager.ts'
import { InputManager } from './lib/managers/InputManager.ts'
import { TestManager } from './lib/managers/TestManager.ts'
import { arrayIncludesAny } from './lib/utils/arrayIncludesAny.ts'

const progressManager = new ProgressBarManager()
const inputManager = new InputManager()
const testManager = new TestManager()

testManager.regenerateTest( 20 )

inputManager.addListener( 'character', character => {
    progressManager.increaseValue( 5 )

    testManager.typeCharacter( character )
})

inputManager.addListener( 'meta', key => {
    // console.debug( `pressed meta key: ${ key }` )

    if (
        key === 'Backspace'
        && arrayIncludesAny( inputManager.activeModifierKeys, [ 'ControlLeft', 'ControlRight' ] )
        && arrayIncludesAny( inputManager.activeModifierKeys, [ 'ShiftLeft', 'ShiftRight' ] )
    ) {
        testManager.regenerateTest( 20 )
        progressManager.resetProgressBar()
    }
})
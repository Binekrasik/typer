import './styles/app.scss'
import { ProgressBarManager } from './lib/managers/ProgressBarManager.ts'
import { InputManager } from './lib/managers/InputManager.ts'
import { TestManager } from './lib/managers/TestManager.ts'
import { arrayIncludesAny } from './lib/utils/arrayIncludesAny.ts'

/* const updateValueIndicator = () =>
    progressValueIndicator.innerText = `${ progressManager.getValue() } / ${ progressManager.getMaxValue() }` */

const progressManager = new ProgressBarManager()
const inputManager = new InputManager()
const testManager = new TestManager()

const wordCount = 15

// initialize test
testManager.regenerateTest( wordCount )
progressManager.setMaxValue( testManager.getTestLength() )

// const progressValueIndicator = document.querySelector( '#testProgressValue' ) as HTMLHeadingElement
// updateValueIndicator()

inputManager.addListener( 'character', character => {
    // updateValueIndicator()

    if ( testManager.typeCharacter( character ) )
        progressManager.increaseValue( 1 )
})

inputManager.addListener( 'meta', key => {
    // console.debug( `pressed meta key: ${ key }` )

    if (
        key === 'Backspace'
        && arrayIncludesAny( inputManager.activeModifierKeys, [ 'ControlLeft', 'ControlRight' ] )
        && arrayIncludesAny( inputManager.activeModifierKeys, [ 'ShiftLeft', 'ShiftRight' ] )
    ) {
        testManager.regenerateTest( wordCount )
        progressManager.setMaxValue( testManager.getTestLength() )
        progressManager.resetProgressBar()
    }
})
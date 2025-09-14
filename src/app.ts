import './styles/app.scss'
import { ProgressBarManager } from './lib/managers/ProgressBarManager.ts'
import { InputManager } from './lib/managers/InputManager.ts'

const progressManager = new ProgressBarManager()
const inputManager = new InputManager()

const textField = document.querySelector( '#testTextField' ) as HTMLParagraphElement

inputManager.addListener( 'character', character => {
    progressManager.increaseValue( 5 )

    textField.innerHTML += character

    // console.log( character )
})

inputManager.addListener( 'meta', key => {
    console.log( `pressed meta key: ${ key }` )
})
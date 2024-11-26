import './App.scss'

import Typer from './components/typer/Typer'

import { generateText } from '../../utils/text/aiGeneration'
import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'

import dictEnglish from '../../resources/dictionary/english/basic.json'
const dictionary = dictEnglish as string[]

let hydrated = false

const App = () => {
    const [ text, setText ] = useState( '' )
    const apiKey = useRef< string | null >( null )

    const newTest = () => {
        if ( apiKey.current != '' ) {
            const keyPrompt = prompt( 'Api key (leave empty for writing randomly assembled text from the dictionary)' )
            apiKey.current = prompt == null ? '' : keyPrompt
        }

        if ( apiKey.current == '' || !apiKey.current ) {
            const words = new Array< string >

            for ( let i = 0; i < 10; i++ )
                words.push( dictionary[ Math.floor( Math.random() * dictionary.length ) + 1 ] )

            setText( words.join( ' ' ) )
        } else generateText( apiKey.current, prompt( 'Prompt' ) as string ).then( setText )
    }

    useEffect( () => {
        if ( !hydrated ) {
            hydrated = true
            return
        }

        newTest()
    }, [] )

    return (
        <div className='App' >
            {
                text == '' ?
                    <div className='waitContainer' >
                        <motion.p
                            className='waitPrompt'
                            initial={{ y: 50, opacity: 0 }}
                            exit={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1, transition: { duration: 1, ease: [ .2, 1, 0, 1 ] } }}
                        >
                            Please wait
                        </motion.p>
                    </div> : <Typer text={ text } resetTest={ () => location.reload() } />
            }
        </div>
    )
}

export default App
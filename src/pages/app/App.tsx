import './App.scss'

import Typer from './components/typer/Typer'
import { userSettings } from "../../resources/userSettings.ts";
import { dictRegistry } from "../../resources/dictionary/registry.ts";

const dictionary = dictRegistry[ userSettings.test.dictionary ]

const App = () => {
    const newTest = () => {
        const words = new Array< string >

        for ( let i = 0; i < userSettings.test.length; i++ )
            words.push( dictionary[ Math.floor( Math.random() * dictionary.length ) ] )

        return words.join( ' ' )
    }

    return (
        <div className='App' >
            <Typer
                text={ newTest() }
                resetTest={ () => location.reload() }
            />
        </div>
    )
}

export default App
import './App.scss'

import { useState } from 'react'
import { newTest } from '../../resources/dictionary/lib.ts'
import Typer from './components/typer/Typer'

import { userSettings } from '../../resources/userSettings.ts'
import { dictRegistry } from '../../resources/dictionary/registry.ts'

const dictionary = dictRegistry[ userSettings.test.dictionary ]

const App = () => {
    const [ currentTest, setCurrentTest ] = useState( newTest( dictionary ) )

    return (
        <div className='App' >
            <Typer
                text={ currentTest }
                resetTest={ () => setCurrentTest( newTest( dictionary ) ) }
            />
        </div>
    )
}

export default App
import './App.scss'

import Typer from './components/typer/Typer'
import dictEnglish from '../../resources/dictionary/english/basic.json'

const dictionary = dictEnglish as Array< string >

const App = () => {
    const newTest = () => {
        const words = new Array< string >

        for ( let i = 0; i < 100; i++ )
            words.push( dictionary[ Math.floor( Math.random() * dictionary.length ) + 1 ] )

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
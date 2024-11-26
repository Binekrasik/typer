import './App.scss'
import Typer from './components/typer/Typer'

import dictEnglish from '../../resources/dictionary/english_insanity.json'
const dictionary = dictEnglish as string[]

const App = () => {
    const words = new Array< string >

    for ( let i = 0; i < 24; i++ )
        words.push( dictionary[ Math.floor( Math.random() * dictionary.length ) + 1 ] )

    return (
        <div className='App' >
            <Typer
                text={ words.join( ' ' ) }
            />
        </div>
    )
}

export default App
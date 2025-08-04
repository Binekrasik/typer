import englishBasic from './english/basic.json'

interface DictionariesStructure {
    [ name: string ]: Array< string >
}

export const dictRegistry: DictionariesStructure = {}

// register dictionaries
dictRegistry[ 'english' ] = englishBasic
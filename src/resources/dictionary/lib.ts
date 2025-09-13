import { userSettings } from '../userSettings.ts'

export const newTest = ( dictionary: string[] ) => {
    const words = new Array< string >

    for ( let i = 0; i < userSettings.test.length; i++ )
        words.push( dictionary[ Math.floor( Math.random() * dictionary.length ) ] )

    return words.join( ' ' )
}
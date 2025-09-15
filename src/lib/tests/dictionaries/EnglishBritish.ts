import { Dictionary } from './Dictionary.ts'
import { words25k } from './en_gb-25k.ts'

export class EnglishBritish extends Dictionary {
    nextWord () {
        const random = Math.round( Math.random() * words25k.words.length )
        return words25k.words[ random ]
    }
}
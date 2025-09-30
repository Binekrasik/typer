import { Dictionary, type DictionaryWordsDataset } from '../Dictionary.ts'
import { english10k } from './english10k.ts'

export class English extends Dictionary {
    #lastIndex = -1
    #currentDataset: DictionaryWordsDataset = english10k

    nextWord () {
        let random

        while ( true ) {
            random = this.getRandomIndex()

            if ( random === this.#lastIndex )
                if ( random === this.#currentDataset.words.length - 1 ) {
                    random--
                } else random++

            if ( this.#currentDataset.words[ random ].length > 4 )
                if ( Math.random() * 10 > 5 )
                    continue

            this.#lastIndex = random
            return this.#currentDataset.words[ random ].toLowerCase()
        }
    }

    getRandomIndex() {
        return Math.round( Math.pow( Math.random(), 6 ) * this.#currentDataset.words.length )
    }
}
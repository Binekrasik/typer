import { Dictionary, type DictionaryWordsDataset } from '../Dictionary.ts'
import type { KeyPosition, Layout } from '../../layouts/Layout.ts'
import { WeightedPool } from '../../../utils/WeightedPool.ts'
import { english10k } from './english10k.ts'

// same curve as the former `Math.random() ** 6` index, without its ~20% spike on "the"
const RANK_FALLOFF = 5 / 6
const LONG_WORD_LENGTH = 4
const LONG_WORD_WEIGHT = 0.5

// key widths after which a word is ~37% as likely to follow
const KEY_DISTANCE_FALLOFF = 1.5
// moving one finger between keys is slow, repeating the same key isn't
const SAME_FINGER_WEIGHT = 0.1

const RECENT_WORDS_MEMORY = 50
const MAX_PICK_ATTEMPTS = 16

// pools hold indices into `#words`
type WordPool = WeightedPool< number >

const keyTransitionWeight = ( from: KeyPosition, to: KeyPosition | null ) => {
    if ( !to ) return 0

    const distance = Math.hypot( to.x - from.x, to.y - from.y )
    const sameFinger = distance > 0 && to.finger === from.finger

    return Math.exp( -distance / KEY_DISTANCE_FALLOFF ) * ( sameFinger ? SAME_FINGER_WEIGHT : 1 )
}

export class English extends Dictionary {
    #currentDataset: DictionaryWordsDataset = english10k
    #words: Array< string >
    #anyWord = new WeightedPool< WordPool >()
    #followingWords = new Map< string, WeightedPool< WordPool > >()

    #wordsPicked = 0
    #lastPickedAt: Float64Array
    #lastLetter = ''

    constructor ( layout: Layout ) {
        super()

        this.#words = this.#currentDataset.words.map( word => word.toLowerCase() )
        this.#lastPickedAt = new Float64Array( this.#words.length ).fill( -Infinity )

        const wordsByFirstLetter = new Map< string, WordPool >()
        const lastLetters = new Set< string >()

        this.#words.forEach( ( word, rank ) => {
            let pool = wordsByFirstLetter.get( word[ 0 ] )
            if ( !pool )
                wordsByFirstLetter.set( word[ 0 ], pool = new WeightedPool() )

            pool.add( rank, ( rank + 1 ) ** -RANK_FALLOFF * ( word.length > LONG_WORD_LENGTH ? LONG_WORD_WEIGHT : 1 ) )
            lastLetters.add( word[ word.length - 1 ] )
        })

        wordsByFirstLetter.forEach( pool => this.#anyWord.add( pool, pool.getTotalWeight() ) )

        lastLetters.forEach( lastLetter => {
            const from = layout.locateCharacter( lastLetter )
            if ( !from ) return

            const following = new WeightedPool< WordPool >()

            wordsByFirstLetter.forEach( ( pool, firstLetter ) =>
                following.add( pool, pool.getTotalWeight() * keyTransitionWeight( from, layout.locateCharacter( firstLetter ) ) )
            )

            if ( following.getTotalWeight() > 0 )
                this.#followingWords.set( lastLetter, following )
        })
    }

    nextWord () {
        const candidates = this.#followingWords.get( this.#lastLetter ) ?? this.#anyWord
        let attempts = 0
        let index: number

        do index = candidates.pick().pick()
        while ( this.#wordsPicked - this.#lastPickedAt[ index ] <= RECENT_WORDS_MEMORY && ++attempts < MAX_PICK_ATTEMPTS )

        this.#lastPickedAt[ index ] = this.#wordsPicked++

        const word = this.#words[ index ]
        this.#lastLetter = word[ word.length - 1 ]

        return word
    }
}
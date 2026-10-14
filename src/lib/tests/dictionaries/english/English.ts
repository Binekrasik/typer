import { Dictionary, type DictionaryWordsDataset, type WordLengthRange } from '../Dictionary.ts'
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
type WordPool = WeightedPool<number>

const keyTransitionWeight = (from: KeyPosition, to: KeyPosition | null) => {
    if (!to) return 0

    const distance = Math.hypot(to.x - from.x, to.y - from.y)
    const sameFinger = distance > 0 && to.finger === from.finger

    return Math.exp(-distance / KEY_DISTANCE_FALLOFF) * (sameFinger ? SAME_FINGER_WEIGHT : 1)
}

export class English extends Dictionary {
    #currentDataset: DictionaryWordsDataset = english10k
    #layout: Layout
    #words: Array<string>
    #anyWord = new WeightedPool<WordPool>()
    #followingWords = new Map<string, WeightedPool<WordPool>>()
    // words grouped by their first letter, then indexed by their length
    #wordsByFirstLetterAndLength = new Map<string, Array<WordPool>>()

    #wordsPicked = 0
    #lastPickedAt: Float64Array
    #lastLetter = ''

    constructor(layout: Layout) {
        super()

        this.#layout = layout
        this.#words = this.#currentDataset.words.map(word => word.toLowerCase())
        this.#lastPickedAt = new Float64Array(this.#words.length).fill(-Infinity)

        const wordsByFirstLetter = new Map<string, WordPool>()
        const lastLetters = new Set<string>()

        this.#words.forEach((word, rank) => {
            let pool = wordsByFirstLetter.get(word[0])
            if (!pool)
                wordsByFirstLetter.set(word[0], pool = new WeightedPool())

            let poolsByLength = this.#wordsByFirstLetterAndLength.get(word[0])
            if (!poolsByLength)
                this.#wordsByFirstLetterAndLength.set(word[0], poolsByLength = [])

            let lengthPool = poolsByLength[word.length]
            if (!lengthPool)
                poolsByLength[word.length] = lengthPool = new WeightedPool()

            const weight = (rank + 1) ** -RANK_FALLOFF * (word.length > LONG_WORD_LENGTH ? LONG_WORD_WEIGHT : 1)
            pool.add(rank, weight)
            lengthPool.add(rank, weight)
            lastLetters.add(word[word.length - 1])
        })

        wordsByFirstLetter.forEach(pool => this.#anyWord.add(pool, pool.getTotalWeight()))

        lastLetters.forEach(lastLetter => {
            const from = layout.locateCharacter(lastLetter)
            if (!from) return

            const following = new WeightedPool<WordPool>()

            wordsByFirstLetter.forEach((pool, firstLetter) =>
                following.add(pool, pool.getTotalWeight() * keyTransitionWeight(from, layout.locateCharacter(firstLetter)))
            )

            if (following.getTotalWeight() > 0)
                this.#followingWords.set(lastLetter, following)
        })
    }

    nextWord(length?: WordLengthRange) {
        const candidates = length
            ? this.candidatesWithin(length)
            : this.#followingWords.get(this.#lastLetter) ?? this.#anyWord
        let attempts = 0
        let index: number

        do index = candidates.pick().pick()
        while (this.#wordsPicked - this.#lastPickedAt[index] <= RECENT_WORDS_MEMORY && ++attempts < MAX_PICK_ATTEMPTS)

        this.#lastPickedAt[index] = this.#wordsPicked++

        const word = this.#words[index]
        this.#lastLetter = word[word.length - 1]

        return word
    }

    private candidatesWithin(length: WordLengthRange) {
        const from = this.#layout.locateCharacter(this.#lastLetter)
        const candidates = new WeightedPool<WordPool>()

        this.#wordsByFirstLetterAndLength.forEach((poolsByLength, firstLetter) => {
            const transitionWeight = from ? keyTransitionWeight(from, this.#layout.locateCharacter(firstLetter)) : 1

            for (let wordLength = length.min; wordLength <= length.max; wordLength++) {
                const pool = poolsByLength[wordLength]
                if (pool)
                    candidates.add(pool, pool.getTotalWeight() * transitionWeight)
            }
        })

        if (candidates.getTotalWeight() === 0)
            throw Error(`Couldn't find any word between ${length.min} and ${length.max} letters long.`)

        return candidates
    }
}
export abstract class Dictionary {
    abstract nextWord ( length?: WordLengthRange ): string
}

export interface DictionaryWordsDataset {
    name: string
    words: Array< string >
}

export interface WordLengthRange {
    min: number
    max: number
}
export abstract class Dictionary {
    abstract nextWord (): string
}

export interface DictionaryWordsDataset {
    name: string
    words: Array< string >
}
export interface TestState {
    current: {
        word: {
            index: number
            length: number
        }

        character: {
            index: number
            symbol: string
        }
    }

    total: {
        charactersWritten: {
            correct: number
            total: number
        }

        test: {
            start: number
            end: number
            total: number
            length: number
            result: 'succeeded' | 'failed' | null
        }
    }
}
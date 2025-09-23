import type { TestDifficulty } from '../TestDifficultyEntries.ts'

export type TestRankDisplayProperties = {
    name: string
    color: string
    comments
}

export const TestRanks: Record< string, TestRankDisplayProperties > = {
    ss: {
        name: 'SS',
        color: '#fb6fff',
        comments: [

        ],
    },
    s: {
        name: 'S',
        color: '#bf94ff',
        comments: [

        ],
    },
    a: {
        name: 'A',
        color: '#b7f7a3',
        comments: [

        ],
    },
    b: {
        name: 'B',
        color: '#faff5a',
        comments: [

        ],
    },
    c: {
        name: 'C',
        color: '#ff8c53',
        comments: [

        ],
    },
    d: {
        name: 'D',
        color: '#ff5252',
        comments: [

        ],
    },
    f: {
        name: 'F',
        color: '#902c2c',
        comments: [
            "you're bad bro",
            "type faster",
            "just put the fries in the bag",
            "what a newbie you are"
        ],
    },
}

export interface TestResults {
    rank: TestRankDisplayProperties
    rating: number
    difficulty: TestDifficulty
    duration: number
    length: number
    speed: number
    accuracy: number
    username: string
}
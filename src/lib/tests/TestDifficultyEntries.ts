export interface TestDifficulty {
    id: string
    name: string
    maxDelta: number
    penalizationIntervalDelay: number
    penaltyMultiplier: number
    incorrectCharacterPenalty: number
}

export const TestDifficultyEntries: {
    [ name: string ]: TestDifficulty
} = {
    [ 'newbie' ]: {
        id: 'newbie',
        name: 'newbie',
        maxDelta: 300,
        penalizationIntervalDelay: 100,
        penaltyMultiplier: 0.15,
        incorrectCharacterPenalty: 10,
    },
    [ 'average' ]: {
        id: 'average',
        name: 'average',
        maxDelta: 180,
        penalizationIntervalDelay: 80,
        penaltyMultiplier: 0.25,
        incorrectCharacterPenalty: 20,
    },
    [ 'thock' ]: {
        id: 'thock',
        name: 'thock',
        maxDelta: 80,
        penalizationIntervalDelay: 40,
        penaltyMultiplier: 1.5,
        incorrectCharacterPenalty: 40
    },
    [ 'freak' ]: {
        id: 'freak',
        name: 'freak',
        maxDelta: 50,
        penalizationIntervalDelay: 20,
        penaltyMultiplier: 4,
        incorrectCharacterPenalty: 60,
    }
}
export interface TestDifficulty {
    id: string
    name: string
    maxDelta: number
    penalizationIntervalDelay: number
    penaltyMultiplier: number
    incorrectCharacterPenalty: number
    rewardMultiplier: number
}

export const TestDifficultyEntries: {
    [ name: string ]: TestDifficulty
} = {
    [ 'newbie' ]: {
        id: 'newbie',
        name: 'newbie',
        maxDelta: 300,
        penalizationIntervalDelay: 80,
        penaltyMultiplier: 0.1,
        incorrectCharacterPenalty: 4,
        rewardMultiplier: 10,
    },
    [ 'average' ]: {
        id: 'average',
        name: 'average',
        maxDelta: 200,
        penalizationIntervalDelay: 50,
        penaltyMultiplier: 0.14,
        incorrectCharacterPenalty: 6,
        rewardMultiplier: 5,
    },
    [ 'intermediate' ]: {
        id: 'intermediate',
        name: 'intermediate',
        maxDelta: 120,
        penalizationIntervalDelay: 40,
        penaltyMultiplier: 0.2,
        incorrectCharacterPenalty: 6,
        rewardMultiplier: 2.5,
    },
    [ 'exceptional' ]: {
        id: 'exceptional',
        name: 'exceptional',
        maxDelta: 60,
        penalizationIntervalDelay: 20,
        penaltyMultiplier: 0.4,
        incorrectCharacterPenalty: 6,
        rewardMultiplier: 2.5,
    },
    [ 'thock' ]: {
        id: 'thock',
        name: 'thock',
        maxDelta: 60,
        penalizationIntervalDelay: 20,
        penaltyMultiplier: 1,
        incorrectCharacterPenalty: 8,
        rewardMultiplier: 2,
    },
    [ 'lobotomy' ]: {
        id: 'lobotomy',
        name: 'lobotomy',
        maxDelta: 50,
        penalizationIntervalDelay: 10,
        penaltyMultiplier: 2,
        incorrectCharacterPenalty: 60,
        rewardMultiplier: 1,
    }
}
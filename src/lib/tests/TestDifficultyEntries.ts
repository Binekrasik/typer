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
        penalizationIntervalDelay: 100,
        penaltyMultiplier: 0.05,
        incorrectCharacterPenalty: 10,
        rewardMultiplier: 10,
    },
    [ 'average' ]: {
        id: 'average',
        name: 'average',
        maxDelta: 160,
        penalizationIntervalDelay: 80,
        penaltyMultiplier: 0.25,
        incorrectCharacterPenalty: 15,
        rewardMultiplier: 5,
    },
    [ 'intermediate' ]: {
        id: 'intermediate',
        name: 'intermediate',
        maxDelta: 120,
        penalizationIntervalDelay: 70,
        penaltyMultiplier: 0.5,
        incorrectCharacterPenalty: 25,
        rewardMultiplier: 2.5,
    },
    [ 'exceptional' ]: {
        id: 'exceptional',
        name: 'exceptional',
        maxDelta: 96,
        penalizationIntervalDelay: 60,
        penaltyMultiplier: 0.75,
        incorrectCharacterPenalty: 32,
        rewardMultiplier: 2,
    },
    [ 'thock' ]: {
        id: 'thock',
        name: 'thock',
        maxDelta: 80,
        penalizationIntervalDelay: 40,
        penaltyMultiplier: 1.5,
        incorrectCharacterPenalty: 40,
        rewardMultiplier: 1,
    },
    [ 'lobotomy' ]: {
        id: 'lobotomy',
        name: 'lobotomy',
        maxDelta: 60,
        penalizationIntervalDelay: 20,
        penaltyMultiplier: 4,
        incorrectCharacterPenalty: 60,
        rewardMultiplier: .5,
    }
}
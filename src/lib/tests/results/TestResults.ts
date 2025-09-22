import type { TestDifficulty } from '../TestDifficultyEntries.ts'

export type TestRankDisplayProperties = {
    name: string
    color: string
}

export const TestRanks: Record< string, TestRankDisplayProperties > = {
    ss: { name: 'SS', color: '#fb6fff', },
    s: { name: 'S', color: '#bf94ff', },
    a: { name: 'A', color: '#b7f7a3' },
    b: { name: 'B', color: '#faff5a' },
    c: { name: 'C', color: '#ff8c53' },
    d: { name: 'D', color: '#ff5252' },
    f: { name: 'F', color: '#500699' },
}

export interface TestResults {
    rank: TestRankDisplayProperties
    rating: number
    difficulty: TestDifficulty
    dateTimestamp: number
}
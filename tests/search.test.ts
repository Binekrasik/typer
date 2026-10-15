import { describe, expect, test } from 'bun:test'
import { matchesQuery, matchRanges } from '../src/lib/settings/search.ts'

describe('settings search', () => {
    test('needs every word of the query somewhere', () => {
        expect(matchesQuery('audio master volume sound', 'vol mas')).toBe(true)
        expect(matchesQuery('audio master volume sound', 'VOLUME')).toBe(true)
        expect(matchesQuery('audio master volume sound', 'volume theme')).toBe(false)
        expect(matchesQuery('anything', '   ')).toBe(true)
    })

    test('finds the ranges to highlight', () => {
        expect(matchRanges('master volume', 'vol')).toEqual([[7, 10]])
        expect(matchRanges('reset test', 'e')).toEqual([[1, 2], [3, 4], [7, 8]])
        // overlapping words merge
        expect(matchRanges('keybinds', 'key ybi')).toEqual([[0, 5]])
        expect(matchRanges('theme', '')).toEqual([])
    })
})

const tokenize = (query: string) => query.toLowerCase().split(/\s+/).filter(Boolean)

/**
 * Checks whether every word of the `query` appears somewhere in the `haystack`.
 */
export const matchesQuery = (haystack: string, query: string) => {
    const text = haystack.toLowerCase()
    return tokenize(query).every(token => text.includes(token))
}

/**
 * Finds the parts of the `text` that match a word of the `query`.
 * @returns sorted, non-overlapping `[start, end)` ranges
 */
export const matchRanges = (text: string, query: string): Array<[number, number]> => {
    const lowerText = text.toLowerCase()
    const ranges: Array<[number, number]> = []

    for (const token of tokenize(query))
        for (let index = lowerText.indexOf(token); index !== -1; index = lowerText.indexOf(token, index + token.length))
            ranges.push([index, index + token.length])

    ranges.sort((a, b) => a[0] - b[0])

    // overlapping words highlight as one range
    return ranges.reduce<Array<[number, number]>>((merged, range) => {
        const last = merged[merged.length - 1]
        if (last && range[0] <= last[1]) last[1] = Math.max(last[1], range[1])
        else merged.push([...range])

        return merged
    }, [])
}

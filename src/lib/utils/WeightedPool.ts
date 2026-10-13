/**
 * Picks random entries with a chance proportional to their weight
 */
export class WeightedPool< T > {
    readonly #entries: Array< T > = []
    readonly #cumulativeWeights: Array< number > = []
    #totalWeight = 0

    add ( entry: T, weight: number ) {
        this.#totalWeight += weight
        this.#entries.push( entry )
        this.#cumulativeWeights.push( this.#totalWeight )
    }

    pick (): T {
        const target = Math.random() * this.#totalWeight
        let low = 0
        let high = this.#cumulativeWeights.length - 1

        while ( low < high ) {
            const middle = ( low + high ) >>> 1

            if ( this.#cumulativeWeights[ middle ] > target )
                high = middle
            else low = middle + 1
        }

        return this.#entries[ low ]
    }

    getTotalWeight = () => this.#totalWeight
}
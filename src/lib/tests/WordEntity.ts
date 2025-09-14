export class WordEntity {
    readonly textContent: string
    readonly index: number
    readonly length: number
    #symbols: string[] = []

    constructor ( textContent: string, wordIndex: number ) {
        this.index = wordIndex
        this.textContent = textContent
        this.length = textContent.length

        for ( const symbol of textContent )
            this.#symbols.push( symbol )
    }

    toSpanArray (): string[] {
        const generated: string[] = []

        this.#symbols.forEach( ( symbol, index ) => {
            generated.push(
                `<span id="currentTest-word-${ this.index }-letter-${ index }" data-state="untyped">${ symbol }</span>`
            )
        })

        return generated
    }

    getSymbol ( index: number ): string | null {
        const symbol = this.#symbols[ index ]
        return symbol ? symbol : null
    }
}
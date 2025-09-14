export class ProgressBarManager {
    public readonly barElement: HTMLDivElement
    #value: number = 0

    constructor () {
        // check if the progress bar element actually exists
        const barElement = document.querySelector( '.progressValue' )
        if ( !barElement )
            throw Error( 'Expected HTMLDivElement from query for "#testProgressBar.progressValue", got null instead.' )

        this.barElement = barElement as HTMLDivElement

        this.setValue( this.#value )
    }

    resetProgressBar () {
        this.#value = 0
        this.syncProgressBar()
    }

    syncProgressBar = () => this.barElement.style.width = `${ this.#value }%`

    getValue = () => this.#value

    setValue ( value: number ) {
        if ( value > 100 || value < 0 )
            throw new TypeError( 'Progress bar value shouldn\'t be beyond the range of 0 to 100%.' )

        this.#value = value

        this.syncProgressBar()
    }

    increaseValue ( amount: number ) {
        // scary math!
        this.#value += this.#value + amount > 100 ? -( this.#value - ( amount + ( 100 - this.#value ) ) ) : amount

        this.syncProgressBar()
    }

    decreaseValue = ( amount: number ) => this.increaseValue( -amount )
}
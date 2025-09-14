export class ProgressBarManager {
    readonly barElement: HTMLDivElement
    #maxValue: number = 100
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

    syncProgressBar = () => this.barElement.style.width = `${ ( this.#value / this.#maxValue ) * 100 }%`

    getValue = () => this.#value

    setValue ( value: number ) {
        if ( value > this.#maxValue || value < 0 )
            throw new TypeError( `Progress bar value shouldn't be beyond the range of 0 - ${ this.#maxValue }.` )

        this.#value = value

        this.syncProgressBar()
    }

    setMaxValue ( maxValue: number ) {
        this.#maxValue = maxValue

        // clamp the current value
        this.#value = this.#value > maxValue ? maxValue : this.#value
    }

    getMaxValue = () => this.#maxValue

    increaseValue ( amount: number ) {
        // scary math!
        this.#value += this.#value + amount > this.#maxValue ? 0 : amount

        this.syncProgressBar()
    }

    decreaseValue = ( amount: number ) => this.increaseValue( -amount )
}
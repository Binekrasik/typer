import { arrayYoink } from '../utils/arrays.ts'

type ProgressEventType = 'valueChange'
type ProgressEventExec = () => void

interface ProgressEventListener {
    type: ProgressEventType
    exec: ProgressEventExec
}

export class ProgressBarManager {
    #listeners: Array< ProgressEventListener > = []

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

    addListener = ( listener: ProgressEventListener ) => this.#listeners.push( listener )
    removeListener = ( listener: ProgressEventListener ) => arrayYoink( this.#listeners, listener )

    callListeners ( type: ProgressEventType ) {
        this.#listeners
            .filter( listener => listener.type === type )
            .forEach( listener => listener.exec() )
    }

    reset = () => {
        this.setMaxValue( 100 )
        this.setValue( 0 )
    }

    syncProgressBar = () => this.barElement.style.width = `${ this.getPercentageValue() }%`

    getValue = () => this.#value
    getPercentageValue = () => ( this.#value / this.#maxValue ) * 100

    setValue ( value: number ) {
        this.#value = value > this.#maxValue ? this.#maxValue : value < 0 ? 0 : value
        this.syncProgressBar()

        this.callListeners( 'valueChange' )
    }

    setMaxValue ( maxValue: number ) {
        this.#maxValue = maxValue < 0 ? 0 : maxValue

        // clamp the current value
        this.setValue( this.#value > maxValue ? maxValue : this.#value )
    }

    getMaxValue = () => this.#maxValue

    increaseValue = ( amount: number ): number => {
        this.setValue( this.#value + ( this.#value + amount > this.#maxValue ? this.#value + amount - this.#maxValue : amount ) )
        return this.#value + amount > this.#maxValue ? 0 : amount
    }

    decreaseValue = ( amount: number ) =>
        this.increaseValue( -amount )
}
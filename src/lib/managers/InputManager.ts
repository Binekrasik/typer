import type { Layout } from '../tests/layouts/Layout.ts'
import { CzechQwertz } from '../tests/layouts/CzechQwertz.ts'
import { arrayYoink } from '../utils/arrays.ts'

type InputListenerType = 'character' | 'meta'
type InputListenerExec = ( character: string ) => void

interface InputListener {
    type: InputListenerType
    exec: InputListenerExec
}

export class InputManager {
    #listeners: Array< InputListener > = []

    #internalKeypressListener: ( ( event: KeyboardEvent ) => void ) | null = null
    #internalKeyreleaseListener: ( ( event: KeyboardEvent ) => void ) | null = null

    #activeLayout: Layout
    readonly activeModifierKeys: Array< string > = []

    constructor ( layout?: Layout ) {
        this.#activeLayout = layout ? layout : new CzechQwertz()
        this.createInternalHooks()
    }

    destroy () {
        this.destroyHooks()
    }

    private destroyHooks () {
        // remove internal event listener
        if ( this.#internalKeypressListener )
            document.removeEventListener( 'keydown', this.#internalKeypressListener )

        // remove internal event listener
        if ( this.#internalKeyreleaseListener )
            document.removeEventListener( 'keyup', this.#internalKeyreleaseListener )
    }

    private createInternalHooks () {
        // check if we already registered the internal event listeners
        if (
            this.#internalKeypressListener
            || this.#internalKeyreleaseListener
        ) this.destroyHooks()

        this.#internalKeypressListener = event => {
            if ( this.#activeLayout.isModifier( event.code ) ) {
                this.activeModifierKeys.push( event.code )
                event.preventDefault()
            } else {
                // call meta key listeners
                this.#listeners
                    .filter( listener => listener.type === 'meta' )
                    .forEach( listener => {
                        const matched = this.#activeLayout.matchMetaKey( event.code )

                        if ( matched ) {
                            event.preventDefault()
                            listener.exec( matched )
                        }
                    })

                // call character listeners
                this.#listeners
                    .filter( listener => listener.type === 'character' )
                    .forEach( listener => {
                        const matched = this.#activeLayout.matchCharacter( event.code, this.activeModifierKeys )

                        if ( matched ) {
                            event.preventDefault()
                            listener.exec( matched )
                        }
                    })
            }
        }

        this.#internalKeyreleaseListener = event => {
            if ( this.#activeLayout.isModifier( event.code ) ) {
                const index = this.activeModifierKeys.indexOf( event.code )

                // remove the modifier key as it is no longer pressed
                if ( index !== -1 )
                    this.activeModifierKeys.splice( index, 1 )
            }
        }

        // register internal events
        document.addEventListener( 'keydown', this.#internalKeypressListener )
        document.addEventListener( 'keyup', this.#internalKeyreleaseListener )
    }

    addListener = (
        type: InputListenerType,
        listener: InputListenerExec
    ) => this.#listeners.push({
        type: type,
        exec: listener,
    })

    removeListener ( listener: InputListener ) {
        arrayYoink( this.#listeners, listener )
    }

    setLayout = ( layout: Layout ) => this.#activeLayout = layout
}
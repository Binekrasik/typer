import { defaultSettings } from '../settings/defaults.ts'
import { arrayYoink } from '../utils/arrays.ts'

export type SettingsEventType = 'valuechange'

export type SettingsEntry = {
    name: string
    value: any
}

export interface SettingsHolder {
    [ id: string ]: SettingsEntry
}

export interface SettingsListener {
    type: SettingsEventType
    exec: ( value: any ) => void
}

export class SettingsManager {
    static readonly localStorageKey = 'typerSavedSettingsJsonObject'
    readonly #settings: SettingsHolder = {}
    readonly #listeners: Array< SettingsListener > = []

    constructor () {
        this.#settings = this.loadSettings()
        this.saveCurrentSettings()
    }

    // --- - - - - - - - ---
    //        EVENTS
    // --- - - - - - - - ---

    addListener = ( listener: SettingsListener ) => this.#listeners.push( listener )
    removeListener = ( listener: SettingsListener ) => arrayYoink( this.#listeners, listener )

    emitEvent = ( type: SettingsEventType, value: any ) =>
        this.#listeners
            .filter( listener => listener.type === type )
            .forEach( listener => listener.exec( value ) )

    // --- - - - - - - - ---
    //   LOADING & SAVING
    // --- - - - - - - - ---

    loadSettings (): SettingsHolder {
        let tempSettings = localStorage.getItem( SettingsManager.localStorageKey )
        if ( !tempSettings )
            return this.loadDefaultSettings()

        return JSON.parse( tempSettings as string ) as SettingsHolder
    }

    loadDefaultSettings = () => defaultSettings
    saveCurrentSettings = () => localStorage.setItem( SettingsManager.localStorageKey, JSON.stringify( this.#settings ) )

    get = ( id: string ) => {
        console.debug( 'Settings object: ' )
        console.debug( this.#settings )
        console.debug( this.#settings[ id ] )
        return this.#settings[ id ]
    }
    set ( id: string, value: any ) {
        this.#settings[ id ] = value

        this.emitEvent( 'valuechange', { id, value } )
    }
}
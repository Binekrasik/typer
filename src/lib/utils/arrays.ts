/**
 * Checks whether the `array` includes any of the `entries`
 */
export const arrayIncludesAny = ( array: any[], entries: any[] ) => {
    let includesAnyEntry = false

    entries.forEach( entry => {
        if ( array.includes( entry ) ) {
            includesAnyEntry = true
            return // return early to save some performance
        }
    })

    return includesAnyEntry
}

/**
 * Removes an `entry` from the `array`
 */
export const arrayYoink = ( array: any[], entry: any ) => {
    const index = array.indexOf( entry )
    if ( index === -1 )
        throw Error( 'Couldn\'t find the provided array entry to remove.' )

    array.splice( index, 1 )
}
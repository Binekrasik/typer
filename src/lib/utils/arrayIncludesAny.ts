export function arrayIncludesAny ( array: any[], entries: any[] ) {
    let includes = false

    entries.forEach( entry => {
        if ( array.includes( entry ) ) {
            includes = true
            return
        }
    })

    return includes
}
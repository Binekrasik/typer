import sanitizeHtml from 'sanitize-html'

export class Debug {
    static debugElement = document.querySelector( '#debugOverlay' ) as HTMLDivElement

    static setContent ( html: string ) {
        this.debugElement.innerHTML = sanitizeHtml( html, { allowedAttributes: { '*': [ 'style' ] } } )
    }
}
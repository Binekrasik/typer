export class Debug {
    static debugElement = document.querySelector( '#debugOverlay' ) as HTMLDivElement

    static setContent ( html: string ) {
        this.debugElement.innerHTML = html
    }
}
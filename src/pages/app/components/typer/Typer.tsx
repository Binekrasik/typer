import './Typer.scss'
import { useCallback, useEffect, useState } from 'react'

type CaretType = 'underline' | 'bar'

let caretInitialized = false
let charactersTotal = 0

const Typer = ( { text }: { text: string } ) => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const words = new Array< string >

    const [ currentIndex, setCurrentIndex ] = useState( { word: 0, character: 0, total: 0 } )
    const [ caretProperties, setCaretProperties ] = useState( { x: 0, y: 0, width: -1, height: -1 } )

    const caretType: CaretType = 'underline'

    let tempCharactersCounter = 0

    const updateCaret = useCallback( () => {
        const span = document.querySelector( `#typer-character-${ currentIndex.total + 1 }` ) as HTMLSpanElement
        const nextSpan = document.querySelector( `#typer-character-${ currentIndex.total + 2 }` ) as HTMLSpanElement

        switch ( caretType as CaretType ) {
            case 'bar':
                setCaretProperties( { x: span.offsetLeft + span.offsetWidth, y: span.offsetTop, width: -1, height: span.offsetHeight } )
                break

            case 'underline':
                setCaretProperties( { x: span.offsetLeft + span.offsetWidth, y: span.offsetTop + span.offsetHeight - 5, width: nextSpan ? nextSpan.offsetWidth : span.offsetWidth, height: -1 } )
                break
        }
    }, [ currentIndex, caretType ] )

    const createErrorCharacter = useCallback( ( span: HTMLSpanElement, event: KeyboardEvent ) => {
        const textContainer = document.querySelector( '.text' ) as HTMLParagraphElement
        const spanElement = document.createElement( 'span' )

        document.querySelectorAll( '.character-error' ).forEach( element => element.remove() )

        spanElement.className = `character-error`
        spanElement.innerText = event.key

        spanElement.style.left = `${ span.offsetLeft }px`
        spanElement.style.top = `${ span.offsetTop - span.offsetHeight / 2 }px`
        spanElement.style.height = `${ span.offsetHeight }px`

        textContainer.appendChild( spanElement )

        setTimeout( () => spanElement.remove(), 2000 )
    }, [ ] )

    const keypressHandler = useCallback( ( event: KeyboardEvent ) => {
        event.preventDefault()

        if ( words[ currentIndex.word ][ currentIndex.character ] == event.key ) {
            updateCaret()

            if ( words[ currentIndex.word ].length == currentIndex.character + 1 ) {
                setCurrentIndex( { word: currentIndex.word + 1, character: 0, total: currentIndex.total + 1 } )
            } else setCurrentIndex( { word: currentIndex.word, character: currentIndex.character + 1, total: currentIndex.total + 1 } )
        } else {
            const span = document.querySelector( `#typer-character-${ currentIndex.total + 1 }` ) as HTMLSpanElement
            createErrorCharacter( span, event )
        }
    }, [ words, currentIndex, updateCaret, createErrorCharacter ] )

    useEffect( () => {
        document.addEventListener( 'keypress', keypressHandler )

        if ( !caretInitialized ) {
            const span = document.querySelector( `#typer-character-${ currentIndex.total + 1 }` ) as HTMLSpanElement

            switch ( caretType as CaretType ) {
                case 'bar':
                    setCaretProperties( { x: span.offsetLeft, y: span.offsetTop, width: -1, height: span.offsetHeight } )
                    break
    
                case 'underline':
                    setCaretProperties( { x: span.offsetLeft, y: span.offsetTop + span.offsetHeight - 5, width: span.offsetWidth, height: 3 } )
                    break
            }

            caretInitialized = true
        }
        
        return () => document.removeEventListener( 'keypress', keypressHandler )
    }, [ currentIndex.total, keypressHandler ] )

    const createWordsArray = ( array: Array< string > ) => new Array< string >().concat( ...array.map( n => [ n, ' ' ] ) ).slice( 0, -1 )

    return (
        <div className='Typer'>
            <div className='Info' >
                <p className='Progress' >{ `${ currentIndex.total } / ${ charactersTotal } - ${ Math.round( currentIndex.total / charactersTotal * 100 ) }%` }</p>

                <progress value={ currentIndex.total } max={ charactersTotal } />
            </div>

            <div
                className='caret'
                style={{
                    left: `${ caretProperties.x }px`,
                    top: `${ caretProperties.y }px`,
                    transform: caretType as CaretType == 'underline' ? 'translateY( 0 ) translateX( 0 )' : '',
                    width: caretProperties.width == -1 ? 3 : caretProperties.width,
                    height: caretProperties.height == -1 ? caretType as CaretType == 'underline' ? 3 : '1.5rem' : caretProperties.height
                }}
            />

            <p className='text' >
                {
                    createWordsArray( text.split( ' ' ) ).map( ( word, wordIndex ) => {
                        words.push( word )

                        return (
                            <span
                                className='word'
                                id={ `typer-word-${ wordIndex }` }
                                key={ `typer-word-${ wordIndex }` }
                            >
                                {
                                    word.split( '' ).map( ( character, i ) => {
                                        tempCharactersCounter++
                                        charactersTotal += tempCharactersCounter > charactersTotal ? 1 : 0

                                        return (
                                            <span
                                                className={ `character character-${ currentIndex.word > wordIndex || ( currentIndex.word == wordIndex && currentIndex.character > i ) ? 'typed' : 'untyped' } ${ currentIndex.character == i && currentIndex.word == wordIndex ? 'character-current' : '' }` }
                                                id={ `typer-character-${ tempCharactersCounter }` }
                                                key={ `typer-character-${ wordIndex }-${ i }` }
                                            >
                                                { character }
                                            </span>
                                        )
                                    })
                                }
                            </span>
                        )
                    })
                }
            </p>
        </div>
    )
}

export default Typer
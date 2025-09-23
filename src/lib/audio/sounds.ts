import { Howl } from 'howler'

export type SoundType = 'type' | 'error' | 'select' | 'score'

export const sounds: Record< SoundType, Howl > = {
    type: new Howl({ src: 'assets/audio/interact.wav', volume: 0.5, preload: true }),
    error: new Howl({ src: 'assets/audio/error.wav', preload: true }),
    select: new Howl({ src: 'assets/audio/select.wav', volume: 0.2, preload: true }),
    score: new Howl({ src: 'assets/audio/score.wav', volume: 0.1, preload: true }),
}
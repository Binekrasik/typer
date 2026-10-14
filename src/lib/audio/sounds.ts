import { Howl } from 'howler'

export type SoundType = 'type' | 'error' | 'select' | 'score' | 'score_f' | 'score_d' | 'score_c' | 'score_b' | 'score_a' | 'score_s' | 'score_ss'

export const sounds: Record<SoundType, Howl> = {
    type: new Howl({ src: 'assets/audio/type.webm', volume: 0.2, preload: true }),
    error: new Howl({ src: 'assets/audio/error.wav', preload: true }),
    select: new Howl({ src: 'assets/audio/select.wav', volume: 0.2, preload: true }),
    score: new Howl({ src: 'assets/audio/score.wav', volume: 0.025, preload: true }),
    score_f: new Howl({ src: 'assets/audio/score/f.ogg', volume: 0.2, preload: true }),
    score_d: new Howl({ src: 'assets/audio/score/d.ogg', volume: 0.2, preload: true }),
    score_c: new Howl({ src: 'assets/audio/score/c.ogg', volume: 0.2, preload: true }),
    score_b: new Howl({ src: 'assets/audio/score/b.ogg', volume: 0.2, preload: true }),
    score_a: new Howl({ src: 'assets/audio/score/a.ogg', volume: 0.2, preload: true }),
    score_s: new Howl({ src: 'assets/audio/score/s.ogg', volume: 0.2, preload: true }),
    score_ss: new Howl({ src: 'assets/audio/score/ss_1.ogg', volume: 0.2, preload: true }),
}
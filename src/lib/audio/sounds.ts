export type SoundType = 'type' | 'select' | 'score' | 'score_f' | 'score_d' | 'score_c' | 'score_b' | 'score_a' | 'score_s' | 'score_ss'

const context = new AudioContext()

class Sound {
    #src: string
    #gain: GainNode
    #buffer: AudioBuffer | null = null
    #loading: Promise<void> | null = null

    constructor(src: string, volume: number, preload = false) {
        this.#src = src
        this.#gain = new GainNode(context, { gain: volume })
        this.#gain.connect(context.destination)

        if (preload) this.load()
    }

    load() {
        return this.#loading ??= fetch(this.#src)
            .then(response => {
                if (!response.ok)
                    throw Error(`Couldn't load the sound ${this.#src} (${response.status}).`)

                return response.arrayBuffer()
            })
            .then(data => context.decodeAudioData(data))
            .then(buffer => {
                this.#buffer = buffer
            })
    }

    // a sound that hasn't loaded yet is skipped, playing it late would be worse
    play() {
        // browsers keep the context suspended until the first click or key press
        if (context.state === 'suspended')
            context.resume()

        if (!this.#buffer) return

        const source = new AudioBufferSourceNode(context, { buffer: this.#buffer })
        source.connect(this.#gain)
        source.start()
    }
}

// only the sounds needed before the first test are preloaded
export const sounds: Record<SoundType, Sound> = {
    type: new Sound('assets/audio/type.webm', 0.2, true),
    select: new Sound('assets/audio/select.ogg', 0.2, true),
    score: new Sound('assets/audio/score.ogg', 0.025),
    score_f: new Sound('assets/audio/score/f.ogg', 0.2),
    score_d: new Sound('assets/audio/score/d.ogg', 0.2),
    score_c: new Sound('assets/audio/score/c.ogg', 0.2),
    score_b: new Sound('assets/audio/score/b.ogg', 0.2),
    score_a: new Sound('assets/audio/score/a.ogg', 0.2),
    score_s: new Sound('assets/audio/score/s.ogg', 0.2),
    score_ss: new Sound('assets/audio/score/ss_1.ogg', 0.2),
}

export const loadSounds = () => Object.values(sounds).forEach(sound => sound.load())

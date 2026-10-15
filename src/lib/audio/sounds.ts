export type SoundType = 'type' | 'tick' | 'select' | 'interact' | 'score' | 'score_f' | 'score_d' | 'score_c' | 'score_b' | 'score_a' | 'score_s' | 'score_ss'
export type SoundChannel = 'typing' | 'interface' | 'results'

const context = new AudioContext()

// every channel goes through the master gain, so each volume setting scales the sounds under it
const master = new GainNode(context)
master.connect(context.destination)

const channels: Record<SoundChannel, GainNode> = {
    typing: new GainNode(context),
    interface: new GainNode(context),
    results: new GainNode(context),
}

Object.values(channels).forEach(channel => channel.connect(master))

class Sound {
    #src: string
    #gain: GainNode
    #buffer: AudioBuffer | null = null
    #loading: Promise<void> | null = null

    constructor(src: string, volume: number, channel: SoundChannel, preload = false) {
        this.#src = src
        this.#gain = new GainNode(context, { gain: volume })
        this.#gain.connect(channels[channel])

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
    // the rate shifts the pitch too, so one sound can tell apart directions like on and off
    play(rate = 1) {
        // browsers keep the context suspended until the first click or key press
        if (context.state === 'suspended')
            context.resume()

        if (!this.#buffer) return

        const source = new AudioBufferSourceNode(context, { buffer: this.#buffer, playbackRate: rate })
        source.connect(this.#gain)
        source.start()
    }
}

// only the sounds needed before the first test are preloaded
export const sounds: Record<SoundType, Sound> = {
    type: new Sound('assets/audio/type.webm', 0.2, 'typing', true),
    // the typing sound for moving around and typing in menus, so it follows the interface volume
    tick: new Sound('assets/audio/type.webm', 0.2, 'interface', true),
    select: new Sound('assets/audio/select.ogg', 0.2, 'interface', true),
    interact: new Sound('assets/audio/interact.ogg', 0.2, 'interface'),
    score: new Sound('assets/audio/score.ogg', 0.025, 'results'),
    score_f: new Sound('assets/audio/score/f.ogg', 0.2, 'results'),
    score_d: new Sound('assets/audio/score/d.ogg', 0.2, 'results'),
    score_c: new Sound('assets/audio/score/c.ogg', 0.2, 'results'),
    score_b: new Sound('assets/audio/score/b.ogg', 0.2, 'results'),
    score_a: new Sound('assets/audio/score/a.ogg', 0.2, 'results'),
    score_s: new Sound('assets/audio/score/s.ogg', 0.2, 'results'),
    score_ss: new Sound('assets/audio/score/ss_1.ogg', 0.2, 'results'),
}

export const loadSounds = () => Object.values(sounds).forEach(sound => sound.load())

// volumes are percentages, squared so the quieter half of a slider isn't all near silence
const gainOf = (volume: number) => (volume / 100) ** 2

export const setMasterVolume = (volume: number) => master.gain.value = gainOf(volume)
export const setChannelVolume = (channel: SoundChannel, volume: number) => channels[channel].gain.value = gainOf(volume)

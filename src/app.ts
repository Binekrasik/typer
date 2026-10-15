import './styles/app.scss'

import { ProgressBarManager } from './lib/managers/ProgressBarManager.ts'
import { InputManager } from './lib/managers/InputManager.ts'
import { type CaretStyle, TestManager } from './lib/managers/TestManager.ts'
import { ScoreManager } from './lib/managers/ScoreManager.ts'
import { TestDifficultyEntries } from './lib/tests/TestDifficultyEntries.ts'
import { DifficultySelectionManager } from './lib/managers/DifficultySelectionManager.ts'
import { SettingsManager } from './lib/managers/SettingsManager.ts'
import { TestResultsManager } from './lib/managers/TestResultsManager.ts'
import { KeybindManager } from './lib/managers/KeybindManager.ts'
import { SettingsPanelManager } from './lib/managers/SettingsPanelManager.ts'
import { loadSounds, setChannelVolume, setMasterVolume, type SoundChannel, type SoundType, sounds } from './lib/audio/sounds.ts'
import { layouts } from './lib/tests/layouts/layouts.ts'
import { dictionaries } from './lib/tests/dictionaries/dictionaries.ts'
import { syncAppearance } from './lib/settings/appearance.ts'
import { settingDefinitions } from './lib/settings/definitions.ts'
import { formatCombo } from './lib/utils/keyCombos.ts'

// import { Debug } from './lib/utils/Debug.ts'

let testsCount = 0

const settingsManager = new SettingsManager()
syncAppearance(settingsManager)

const createLayout = () => layouts[settingsManager.get('keyboard.layout')].create()
const createDictionary = () => dictionaries[settingsManager.get('test.language')].create(inputManager.getLayout())

const progressManager = new ProgressBarManager()
const inputManager = new InputManager(createLayout())
const keybindManager = new KeybindManager(settingsManager)
const testManager = new TestManager(createDictionary())
const scoreManager = new ScoreManager(progressManager, TestDifficultyEntries.average)
const difficultySelectionManager = new DifficultySelectionManager(scoreManager)
const resultsManager = new TestResultsManager()

const settingsPanelManager = new SettingsPanelManager(settingsManager, keybindManager, {
    // a running test can't be paused, so the panel waits until it's over
    canOpen: () => !testManager.isRunning(),
    actions: {
        'data.resetAll': () => settingsManager.resetAll(),
    },
})

const removeLoadingOverlay = () => {
    const loadingOverlay = document.querySelector('#loaderOverlay') as HTMLDivElement
    loadingOverlay.setAttribute('data-loading', 'false')
}

const resetTest = () => {
    console.debug('resetting test')

    if (testManager.getTestState().total.test.start !== -1)
        testManager.finishTest(true)

    resultsManager.hideResults()
    testManager.setTestVisible(true)

    difficultySelectionManager.unlockSelection()
    scoreManager.stopPenalizer()
    testManager.regenerateTest(settingsManager.get('test.length'))
    progressManager.reset()
    progressManager.setMaxValue(testManager.getTestLength())
    difficultySelectionManager.syncDifficultyIndicator()

    removeLoadingOverlay()

    scoreManager.debugScoreProperties()
}

const syncResetNotice = () => {
    const combo = settingsManager.get('keybinds.resetTest')
    const notice = document.querySelector('#testResultsOverlay .resetNotice') as HTMLParagraphElement

    notice.hidden = combo === null;
    (notice.querySelector('span') as HTMLSpanElement).textContent = formatCombo(combo)
}

const syncVolumes = () => {
    setMasterVolume(settingsManager.get('audio.master'))
    setChannelVolume('typing', settingsManager.get('audio.typing'))
    setChannelVolume('interface', settingsManager.get('audio.interface'))
    setChannelVolume('results', settingsManager.get('audio.results'))
}

syncVolumes()
syncResetNotice()
difficultySelectionManager.selectDifficultyById(settingsManager.get('test.difficulty'), false)

// initialize test
window.onload = () => {
    resetTest()
    testManager.setCaretStyle(settingsManager.get('appearance.caretStyle') as CaretStyle)

    setInterval(() => {
        testManager.syncCaret()
        difficultySelectionManager.syncDifficultyIndicator()
    }, 400)
}

// --- - - - - - - - ---
//       SETTINGS
// --- - - - - - - - ---

settingsManager.addListener({
    type: 'valuechange',
    exec: change => {
        switch (change.id) {
            case 'keyboard.layout':
                inputManager.setLayout(createLayout())
                testManager.changeDictionary(createDictionary())
                resetTest()
                break

            case 'test.language':
                testManager.changeDictionary(createDictionary())
                resetTest()
                break

            case 'test.length':
                resetTest()
                break

            case 'test.difficulty':
                difficultySelectionManager.selectDifficultyById(change.value, false)
                break

            case 'appearance.caretStyle':
                testManager.setCaretStyle(change.value as CaretStyle)
                break

            case 'appearance.textSize':
                testManager.syncCaret()
                difficultySelectionManager.syncDifficultyIndicator()
                break

            case 'keybinds.resetTest':
                syncResetNotice()
                break

            case 'audio.master':
            case 'audio.typing':
            case 'audio.interface':
            case 'audio.results':
                syncVolumes()
                break
        }
    }
})

difficultySelectionManager.addListener(difficulty => settingsManager.set('test.difficulty', difficulty.id))

// a volume change previews its own channel, a toggle clicks higher when it turns on, everything else clicks
const previewSounds: Record<string, { sound: SoundType, channel?: SoundChannel }> = {
    'audio.master': { sound: 'type' },
    'audio.typing': { sound: 'type', channel: 'typing' },
    'audio.interface': { sound: 'select', channel: 'interface' },
    'audio.results': { sound: 'score_b', channel: 'results' },
}

const ADJUST_SOUND_INTERVAL = 70
let lastAdjustSound = 0

settingsPanelManager.addListener({
    type: 'adjust',
    exec: id => {
        // holding an arrow key or dragging a range would otherwise stack the sounds into noise
        const now = performance.now()
        if (now - lastAdjustSound < ADJUST_SOUND_INTERVAL) return
        lastAdjustSound = now

        if (id && settingDefinitions[id].type === 'toggle')
            return sounds.interact.play(settingsManager.get(id) ? 1.1 : .9)

        const preview = id ? previewSounds[id] : undefined
        if (!preview) return sounds.select.play()

        // the results sounds only load once the first test starts
        sounds[preview.sound].load().then(() => sounds[preview.sound].play())
    }
})

settingsPanelManager.addListener({
    type: 'open',
    exec: () => {
        inputManager.setEnabled(false)
        keybindManager.setEnabled(false)
    }
})

settingsPanelManager.addListener({
    type: 'close',
    exec: () => {
        inputManager.setEnabled(true)
        keybindManager.setEnabled(true)
    }
})

// --- - - - - - - - ---
//        INPUT
// --- - - - - - - - ---

keybindManager.addListener('openSettings', () => settingsPanelManager.open())
keybindManager.addListener('resetTest', () => resetTest())
keybindManager.addListener('nextDifficulty', () => difficultySelectionManager.cycleSelectedDifficulty('next'))
keybindManager.addListener('previousDifficulty', () => difficultySelectionManager.cycleSelectedDifficulty('previous'))

inputManager.addListener('character', character => {
    if (testManager.needsRegenerating()) return

    sounds.type.play()

    if (testManager.typeCharacter(character)) {
        scoreManager.updateLastTypedTimestamp()
        progressManager.increaseValue(scoreManager.getRewardValue())
    } else progressManager.decreaseValue(scoreManager.getIncorrectCharacterPenalty())
})

progressManager.addListener({
    type: 'valueChange',
    exec: () => {
        if (progressManager.getValue() === 0 && testManager.getTestState().total.test.start !== -1)
            testManager.finishTest(false)
    }
})

testManager.addListener({
    type: 'generate',
    exec: () => {
        difficultySelectionManager.syncDifficultyIndicator()
    }
})

testManager.addListener({
    type: 'start',
    exec: () => {
        difficultySelectionManager.lockSelection()

        progressManager.setValue(progressManager.getMaxValue())
        scoreManager.startPenalizer()

        // the results sounds load while the first test is running
        loadSounds()
    }
})

testManager.addListener({
    type: 'finish',
    exec: () => {
        testsCount++
        const state = testManager.getTestState()

        difficultySelectionManager.unlockSelection()
        scoreManager.stopPenalizer()

        testManager.setTestVisible(false)

        // the rank is taken from the rounded rating so it matches the displayed percentage
        const rating = Math.round(progressManager.getPercentageValue())

        resultsManager.showResults({
            rank: TestResultsManager.getRank(rating),
            rating,
            difficulty: scoreManager.getDifficulty(),
            duration: state.total.test.total / 1000,
            length: settingsManager.get('test.length'),
            speed: 0,
            accuracy: Math.round(state.total.charactersWritten.correct / state.total.charactersWritten.total * 100),
            username: settingsManager.get('profile.username') || 'anonymous',
        })

        /* Debug.setContent(`
            <p style="color: ${state.total.test.result === 'succeeded' ? '#0f0' : '#f00'}">test ${state.total.test.result}</p>
            <p>test this session: ${testsCount}</p>
            <p>difficulty: ${scoreManager.getDifficulty().name}</p>
            <p>test duration: ${state.total.test.total / 1000}s</p>
            <p>total characters: ${state.total.charactersWritten.total}</p>
            <p>correct characters: ${state.total.charactersWritten.correct}</p>
            <p>rating: ${Math.round(progressManager.getPercentageValue())}%</p>
        `) */
    }
})

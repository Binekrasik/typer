import type { TestDifficulty } from '../TestDifficultyEntries.ts'

export type TestRankDisplayProperties = {
    name: string
    color: string
    comments: Array< string >
}

export const TestRanks: Record< string, TestRankDisplayProperties > = {
    ss: {
        name: 'SS',
        color: '#fb6fff',
        comments: [
            "show-off",
            "ok, we get it. you can type",
            "touch grass maybe?",
            "was that a bot? be honest",
            "flawless. now go outside",
            "congrats, this skill pays nothing",
            "who hurt you?",
            "your mom must be so proud",
            "imagine putting this much effort into something useful",
            "we're out of ranks. please stop",
            "ok, calm down",
        ],
    },
    s: {
        name: 'S',
        color: '#bf94ff',
        comments: [
            "almost impressive",
            "so close to being insufferable",
            "not bad. not SS either",
            "SS was right there",
            "nearly perfect. key word: nearly",
            "you peaked. probably",
            "great, now do it again without blinking",
            "fancy fingers you've got there",
            "almost like you practice this",
            "fine. you can stay",
        ],
    },
    a: {
        name: 'A',
        color: '#b7f7a3',
        comments: [
            "solid. boringly solid",
            "respectable. barely",
            "look at you, being above average",
            "good enough to brag, not good enough to win",
            "your teacher would put this on the fridge",
            "a gold star. a small one",
            "competent. how thrilling",
            "an A. how quaint",
            "a fine performance for a mortal",
            "decent. don't let it go to your head",
        ],
    },
    b: {
        name: 'B',
        color: '#faff5a',
        comments: [
            "aggressively average",
            "the participation trophy is in the mail",
            "middle of the pack. as usual",
            "perfectly forgettable",
            "you typed. that's something",
            "B for 'barely trying'",
            "not bad. not good either",
            "mediocrity achieved",
            "well, that happened",
            "your keyboard deserves better",
            "the definition of 'fine'",
        ],
    },
    c: {
        name: 'C',
        color: '#ff8c53',
        comments: [
            "C for 'could be worse'",
            "were you typing with your elbows?",
            "the backspace key misses you already",
            "did you blink the whole time?",
            "at least you finished",
            "hunt and peck champion",
            "your keyboard is filing for divorce",
            "that was... a choice",
            "almost a B. almost.",
            "you call that typing?",
            "a cat walking on the keyboard would do better",
        ],
    },
    d: {
        name: 'D',
        color: '#ff5252',
        comments: [
            "nice. try again",
            "you can do better",
            "decent.",
            "were your hands on the keyboard?",
            "did you type that with your nose?",
            "D for 'definitely not'",
            "autocorrect gave up on you",
            "my grandma types faster. by mail",
            "impressively unimpressive",
            "were you watching tv during this?",
            "apologize to your keyboard",
            "that was painful to watch",
        ],
    },
    f: {
        name: 'F',
        color: '#902c2c',
        comments: [
            "type faster",
            "try again",
            "you're not even trying",
            "F. pay respects",
            "did you fall asleep?",
            "your keyboard is unplugged, right?",
            "a potato would've scored higher",
            "were you typing with oven mitts?",
            "the keys aren't lava, you know",
            "have you considered a career in pottery?",
            "that's not typing, that's a cry for help",
            "bold of you to call that an attempt",
        ],
    },
}

export interface TestResults {
    rank: TestRankDisplayProperties
    rating: number
    difficulty: TestDifficulty
    duration: number
    length: number
    speed: number
    accuracy: number
    username: string
}
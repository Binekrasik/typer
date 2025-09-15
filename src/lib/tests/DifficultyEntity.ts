import type { TestDifficulty } from './TestDifficultyEntries.ts'

export class DifficultyEntity {
    #difficulty: TestDifficulty

    constructor ( difficulty: TestDifficulty ) {
        this.#difficulty = difficulty
    }

    toHtml = () => `<a class="difficultyOption" id="difficultyOption-${ this.#difficulty.id }" data-selected="false">${ this.#difficulty.name }</a>`
}
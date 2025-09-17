import type { TestDifficulty } from './TestDifficultyEntries.ts'

export class DifficultyEntity {
    #difficulty: TestDifficulty
    readonly #index: number

    constructor ( difficulty: TestDifficulty, index: number ) {
        this.#difficulty = difficulty
        this.#index = index
    }

    toHtml = () => `<a class="difficultyOption" id="${ this.getElementId() }" data-selected="false">${ this.#difficulty.name }</a>`
    getElementId = () => `difficultyOption-${ this.#index }`
}
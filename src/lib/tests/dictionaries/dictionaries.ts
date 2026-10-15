import type { Dictionary } from './Dictionary.ts'
import type { Layout } from '../layouts/Layout.ts'
import { English } from './english/English.ts'

export interface DictionaryEntry {
    name: string
    // dictionaries weigh words by how comfortable they are to type, so they depend on the layout
    create: (layout: Layout) => Dictionary
}

export const dictionaries: Record<string, DictionaryEntry> = {
    ['english']: { name: 'english', create: layout => new English(layout) },
}

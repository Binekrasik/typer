import type { Layout } from './Layout.ts'
import { CzechQwertz } from './CzechQwertz.ts'
import { UsQwerty } from './UsQwerty.ts'
import { Dvorak } from './Dvorak.ts'
import { Colemak } from './Colemak.ts'

export interface LayoutEntry {
    name: string
    create: () => Layout
}

export const layouts: Record<string, LayoutEntry> = {
    ['czechQwertz']: { name: 'czech qwertz', create: () => new CzechQwertz() },
    ['usQwerty']: { name: 'us qwerty', create: () => new UsQwerty() },
    ['dvorak']: { name: 'dvorak', create: () => new Dvorak() },
    ['colemak']: { name: 'colemak', create: () => new Colemak() },
}

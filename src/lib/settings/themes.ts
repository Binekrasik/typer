export interface Theme {
    name: string
    primary: string
    background: string
    foreground: string
    error: string
}

export const themes: Record<string, Theme> = {
    ['mint']: { name: 'mint', primary: '#a3f8ce', background: '#000', foreground: '#fff', error: '#ff5252' },
    ['terminal']: { name: 'terminal', primary: '#4dff88', background: '#020a05', foreground: '#e6ffee', error: '#ff5c5c' },
    ['sky']: { name: 'sky', primary: '#8fd3ff', background: '#000', foreground: '#fff', error: '#ff5c7a' },
    ['midnight']: { name: 'midnight', primary: '#a8b8ff', background: '#060814', foreground: '#eef0ff', error: '#ff6b81' },
    ['lavender']: { name: 'lavender', primary: '#cdb4ff', background: '#07050c', foreground: '#fff', error: '#ff5c8a' },
    ['rose']: { name: 'rose', primary: '#ffa3c7', background: '#0a0507', foreground: '#fff', error: '#ffd25c' },
    ['peach']: { name: 'peach', primary: '#ffc29b', background: '#0a0603', foreground: '#fff', error: '#ff4f4f' },
    ['lemon']: { name: 'lemon', primary: '#f1ff8f', background: '#070700', foreground: '#fff', error: '#ff5252' },
    ['mono']: { name: 'mono', primary: '#e8e8e8', background: '#000', foreground: '#fff', error: '#ff5252' },
}

// index.html applies the cached colors before the stylesheet loads, so a themed page doesn't flash mint
export const themeCacheKey = 'typerThemeColors'

export const applyTheme = (id: string) => {
    const theme = themes[id] ?? themes.mint
    const properties: Record<string, string> = {
        '--color-primary': theme.primary,
        '--color-background': theme.background,
        '--color-foreground': theme.foreground,
        '--color-error': theme.error,
    }

    for (const property in properties)
        document.documentElement.style.setProperty(property, properties[property])

    try {
        localStorage.setItem(themeCacheKey, JSON.stringify(properties))
    } catch {
        // the theme still applies, it just flashes the default on the next load
    }
}

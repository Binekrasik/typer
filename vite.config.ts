import { defineConfig } from 'vite'
import { ViteMinifyPlugin } from 'vite-plugin-minify'

// https://vitejs.dev/config/
export default defineConfig({
    server: {
        port: 3000,
    },
    build: {
        // every browser from 2023 on supports modulepreload natively
        modulePreload: { polyfill: false },
        rolldownOptions: {
            output: {
                codeSplitting: {
                    // the dictionary rarely changes, so it stays cached across deploys in its own chunk
                    groups: [{ name: 'dictionary', test: /english10k/ }],
                },
            },
        },
    },
    plugins: [
        ViteMinifyPlugin({
            minifySVG: true,
            minifyCSS: true,
            minifyJS: true,
        }),
    ]
})

import tailwindcss from '@tailwindcss/vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { defineConfig } from 'vite-plus'

const config = defineConfig({
  staged: {
    '*': 'vp check --fix',
  },
  fmt: {
    semi: false,
    printWidth: 80,
    arrowParens: 'avoid',
    singleQuote: true,
    sortImports: true,
    ignorePatterns: ['**/*.gen.ts'],
    sortTailwindcss: {
      stylesheet: './src/shared/ui/styles/globals.css',
      functions: ['clsx', 'cn'],
      preserveWhitespace: true,
    },
  },
  lint: {
    jsPlugins: [
      { name: 'vite-plus', specifier: 'vite-plus/oxlint-plugin' },
      './fsd.mjs',
    ],
    rules: {
      'vite-plus/prefer-vite-plus-imports': 'error',
      'fsd/boundaries': 'error',
    },
    options: { typeAware: true, typeCheck: true },
  },
  test: {
    exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**'],
  },
  resolve: { tsconfigPaths: true },
  plugins: [
    devtools(),
    tailwindcss(),
    tanstackStart({
      router: {
        entry: 'shared/router/index',
        routesDirectory: 'pages',
        generatedRouteTree: 'shared/router/routeTree.gen.ts',
      },
    }),
    viteReact(),
  ],
})

export default config

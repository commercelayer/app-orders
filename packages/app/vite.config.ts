import { defineConfig } from 'vitest/config'
import preact from '@preact/preset-vite'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [preact(), tsconfigPaths()],
  base: '/orders',
  server: {
    fs: {
      strict: false
    }
  },
  test: {
    globals: true,
    environment: 'jsdom'
  }
})

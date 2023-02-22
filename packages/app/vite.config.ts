import { defineConfig } from 'vitest/config'
import preact from '@preact/preset-vite'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [preact(), tsconfigPaths()],
  base: '/orders',
  test: {
    globals: true,
    environment: 'jsdom'
  }
})

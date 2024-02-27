import react from '@vitejs/plugin-react'
import isEmpty from 'lodash/isEmpty'
import externalGlobals from 'rollup-plugin-external-globals'
import { loadEnv } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const basePath = !isEmpty(env.PUBLIC_PROJECT_PATH)
    ? `/${env.PUBLIC_PROJECT_PATH}/`
    : '/'

  return {
    plugins: [react(), tsconfigPaths()],
    envPrefix: 'PUBLIC_',
    base: basePath,
    build: {
      // minify: false,
      modulePreload: false,
      rollupOptions: {
        external: ['react', 'react-dom'],
        plugins: [
          externalGlobals({
            react: 'React',
            'react-dom': 'ReactDOM'
          })
        ]
        // output: {
        //   entryFileNames: `assets/[name].js`
        //   // chunkFileNames: `assets/[name].js`,
        //   // assetFileNames: `assets/[name].[ext]`
        // }
      },
      manifest: 'manifest.json'
    },
    test: {
      globals: true,
      environment: 'jsdom'
    }
  }
})

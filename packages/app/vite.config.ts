import react from '@vitejs/plugin-react'
import externalGlobals from 'rollup-plugin-external-globals'
import { loadEnv } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const basePath =
    env.PUBLIC_PROJECT_PATH != null ? `/${env.PUBLIC_PROJECT_PATH}/` : '/'

  return {
    plugins: [react(), tsconfigPaths()],
    envPrefix: 'PUBLIC_',
    base: basePath,
    build: {
      modulePreload: false,
      rollupOptions: {
        external: ['react', 'react-dom'],
        plugins: [
          externalGlobals({
            react: 'React',
            'react-dom': 'ReactDOM'
          })
        ],
        output: {
          entryFileNames: `assets/[name].js`
          // chunkFileNames: `assets/[name].js`,
          // assetFileNames: `assets/[name].[ext]`
        }
      }
      // sourcemap: true,
      // manifest: true
    },
    // build: {
    //   cssCodeSplit: false,
    //   rollupOptions: {
    //     // make sure to externalize deps that shouldn't be bundled
    //     // into your library
    //     external: ['react', 'react-dom'],
    //     output: {
    //       format: 'umd',
    //       // Provide global variables to use in the UMD build
    //       // for externalized deps
    //       globals: {
    //         react: 'React',
    //         'react-dom': 'ReactDOM'
    //       }
    //     }
    //   }
    // },
    test: {
      globals: true,
      environment: 'jsdom'
    }
  }
})

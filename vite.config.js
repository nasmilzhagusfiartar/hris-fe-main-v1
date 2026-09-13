import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    proxy: {
      '/api/vt': {
        target: 'https://www.virustotal.com/api/v3',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/vt/, '')
      },
      '/api/shodan': {
        target: 'https://api.shodan.io',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/shodan/, '')
      },
      '/api/abuse': {
        target: 'https://api.abuseipdb.com/api/v2',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/abuse/, '')
      }
    }
  }
})

import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss()],
  server: {
    allowedHosts: true,
    proxy: {
      '/api/plantnet': {
        target: 'https://my-api.plantnet.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/plantnet/, ''),
        headers: { 'Origin': 'https://my-api.plantnet.org' },
      },
    },
  },
})

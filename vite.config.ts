import { defineConfig, loadEnv } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [tailwindcss()],
    server: {
      allowedHosts: true,
      proxy: {
        '/api/plantnet': {
          target: 'https://my-api.plantnet.org',
          changeOrigin: true,
          rewrite: (path) => {
            const clean = path.replace(/^\/api\/plantnet/, '')
            const separator = clean.includes('?') ? '&' : '?'
            return `${clean}${separator}api-key=${env.VITE_PLANTNET_API_KEY}`
          },
          headers: { 'Origin': 'https://my-api.plantnet.org' },
        },
      },
    },
  }
})

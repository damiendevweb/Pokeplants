import { defineConfig, loadEnv } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg', 'models/**/*.glb'],
        manifest: {
          name: 'PokéPlants',
          short_name: 'PokéPlants',
          description: 'Découvre, identifie et collectionne des plantes comme un Dresseur !',
          theme_color: '#be2e3a',
          background_color: '#2c1810',
          display: 'standalone',
          start_url: '/',
          scope: '/',
          lang: 'fr',
          icons: [
            {
              src: '/icons/icon-192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: '/icons/icon-512.png',
              sizes: '512x512',
              type: 'image/png',
            },
            {
              src: '/icons/icon-maskable-192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'maskable',
            },
            {
              src: '/icons/icon-maskable-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              },
            },
            {
              urlPattern: /\.(?:glb|gltf)$/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'models-cache',
                expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 30 },
              },
            },
          ],
        },
      }),
    ],
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

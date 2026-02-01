import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'icons/*.png'],
      manifest: {
        name: 'MindGrow Kids',
        short_name: 'MindGrow',
        description: 'Känsloresa för barn och stöd för vuxna.',
        theme_color: '#e6f3ed',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: process.env.NODE_ENV === 'development'
          ? [] // Icons är valfria i development - inga ikoner = inga fel
          : [
              { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
              { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
              { src: 'icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
            ]
      },
      // Ignorera saknade ikoner i development
      injectManifest: {
        globIgnores: ['**/icon-*.png']
      },
      workbox: {
        navigateFallback: 'index.html',
        // Låt API-anrop alltid gå direkt till servern (ingen cache)
        runtimeCaching: [
          {
            urlPattern: /^https?:\/\/localhost:4000\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 10,
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            // För alla andra API-anrop (inklusive via proxy)
            urlPattern: /\/api\/.*/i,
            handler: 'NetworkOnly', // Alltid gå till nätverket, aldrig cache
            options: {
              cacheName: 'api-direct',
            }
          }
        ],
        // Exkludera API-routes från precaching
        globIgnores: ['**/api/**', '**/icon-*.png']
      },
      devOptions: { 
        enabled: true,
        // I development, använd NetworkFirst för API-anrop
        type: 'module'
      }
    })
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:4000'
    }
  }
})


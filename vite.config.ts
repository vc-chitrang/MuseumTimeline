import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Relative base so the same build works on GitHub Pages (sub-path) and on an
// offline museum kiosk served from any folder.
export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Moksha Bhumi · 24 Tirthankaras',
        short_name: 'Moksha Bhumi',
        description: 'Interactive museum map of the moksha places of the 24 Tirthankaras.',
        theme_color: '#16214A',
        background_color: '#16214A',
        display: 'fullscreen',
        orientation: 'any',
        start_url: '.',
        icons: []
      },
      workbox: {
        // Install caches only the app shell (code, fonts, map backdrop), so the
        // first visit is not slowed by a 10 MB download in the background.
        globPatterns: ['**/*.{js,css,html,woff2}', '**/india-map-blur.webp'],
        // Artwork is cached as it is used; the app's background warm-up
        // (src/lib/preload.ts) fetches the rest, so a kiosk that has run once
        // works offline. Stale-while-revalidate picks up re-exported art.
        runtimeCaching: [{
          urlPattern: ({ url }) => /\/assets\/(images|scene|trees|symbols)\//.test(url.pathname),
          handler: 'StaleWhileRevalidate',
          options: { cacheName: 'artwork', expiration: { maxEntries: 120 } }
        }],
        // New versions take over immediately (kiosks and phones never sit on an old build).
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024
      }
    })
  ]
});

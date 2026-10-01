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
      includeAssets: ['assets/images/*'],
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
        // Pre-cache everything so the kiosk works without network.
        globPatterns: ['**/*.{js,css,html,woff2,webp,jpg,png,svg}'],
        // New versions take over immediately (kiosks and phones never sit on an old build).
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024
      }
    })
  ]
});

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'favicon-192.png', 'favicon-512.png', 'robots.txt'],
      injectRegister: 'auto',
      // Dev service worker disabled to prevent conflicts — test offline mode with `npm run build && npm run preview`
      devOptions: {
        enabled: false,
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,json}'],
        // Navigate to index.html when offline (prevents dino page on refresh)
        navigateFallback: '/index.html',
        navigateFallbackAllowlist: [/^(?!\/__).*/],
        navigateFallbackDenylist: [/^\/api/, /^\/auth/, /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/],
        clientsClaim: true,
        skipWaiting: true,
        runtimeCaching: [
          {
            // Cache Google Fonts
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: { maxEntries: 30, maxAgeSeconds: 365 * 24 * 60 * 60 },
            },
          },
          {
            // Cache Firebase/Firestore API calls — network-first so offline falls back to cache
            urlPattern: /^https:\/\/firestore\.googleapis\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'firestore-api',
              expiration: { maxEntries: 100, maxAgeSeconds: 24 * 60 * 60 },
            },
          },
          {
            // Cache weather API (Open-Meteo) — stale while revalidate
            urlPattern: /^https:\/\/api\.open-meteo\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'weather-api',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 },
            },
          },
        ],
      },
      manifest: {
        name: '1A-genda',
        short_name: '1A-genda',
        description: 'A modern class management and task tracking app for students and administrators.',
        start_url: '/',
        display: 'standalone',
        background_color: '#18181b',
        theme_color: '#2563eb',
        icons: [
          { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' },
          { src: '/favicon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/favicon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Firebase — used everywhere, cache once
          'vendor-firebase': [
            'firebase/app',
            'firebase/auth',
            'firebase/firestore',
            'firebase/storage',
          ],
          // MUI — used across many components
          'vendor-mui': [
            '@mui/material',
            '@emotion/react',
            '@emotion/styled',
          ],
          // Recharts — only used by StudentAnalytics
          'vendor-recharts': ['recharts'],
          // PDF export — only used on-demand
          'vendor-pdf': ['jspdf', 'jspdf-autotable'],
          // GSAP — used for animations
          'vendor-gsap': ['gsap'],
          // Markdown rendering
          'vendor-markdown': ['react-markdown', 'remark-gfm'],
        },
      },
    },
  },
})

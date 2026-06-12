import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],

      manifest: {
        name: 'Runway-519',
        short_name: 'Runway',
        description: 'Off-price retail inventory platform',
        theme_color: '#db2777',
        background_color: '#fdf2f8',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },

      workbox: {
        // Cache all static assets
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],

        // Cache strategies
        runtimeCaching: [
          {
            // Supabase API calls — network first, fall back to cache
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 5 * 60, // 5 minutes
              },
              networkTimeoutSeconds: 10,
            },
          },
          {
            // Images — cache first
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
              },
            },
          },
        ],
      },
    }),
  ],
  preview: {
    host: true, // exposes to local network
    port: 4173,
  },
  server: {
    host: true, // also exposes dev server to network
    port: 5173,
  },
  // build: {
  //   rollupOptions: {
  //     output: {
  //       manualChunks: {
  //         'react-vendor': ['react', 'react-dom', 'react-router-dom'],
  //         charts: ['recharts'],
  //         supabase: ['@supabase/supabase-js'],
  //         forms: ['react-hook-form', '@hookform/resolvers', 'zod'],
  //         utils: ['date-fns', 'lucide-react'],
  //       },
  //     },
  //   },
  //   chunkSizeWarningLimit: 600,
  // },
})

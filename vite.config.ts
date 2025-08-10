import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import viteCompression from 'vite-plugin-compression'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // PWA for offline support and caching
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\./,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              }
            }
          }
        ]
      },
      manifest: {
        name: 'AI Automation System',
        short_name: 'AI Auto',
        description: 'High-performance AI automation system',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    }),
    // Gzip compression for production
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz'
    }),
    // Brotli compression for better compression ratios
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br'
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@hooks': resolve(__dirname, 'src/hooks'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@types': resolve(__dirname, 'src/types')
    }
  },
  build: {
    target: 'es2015', // Support older browsers while maintaining performance
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn']
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor libraries into separate chunks
          'react-vendor': ['react', 'react-dom'],
          'router': ['react-router-dom'],
          'query': ['react-query'],
          'utils': ['lodash-es', 'date-fns', 'clsx'],
          'virtual': ['react-virtual', 'react-window']
        },
        // Optimize chunk naming for better caching
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
      }
    },
    // Enable source maps for debugging (disabled in production for performance)
    sourcemap: false,
    // Optimize chunk size warnings
    chunkSizeWarningLimit: 1000
  },
  // Optimize development server
  server: {
    port: 5173,
    host: true,
    // Enable HMR with optimized settings
    hmr: {
      overlay: false
    }
  },
  // Optimize preview server
  preview: {
    port: 4173,
    host: true
  },
  // Optimize CSS
  css: {
    postcss: {
      plugins: [
        require('tailwindcss'),
        require('autoprefixer')
      ]
    }
  }
})
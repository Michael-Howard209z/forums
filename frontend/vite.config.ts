import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5173,
    allowedHosts: [
      'develops-grad-apartment-picture.trycloudflare.com',
      'gojoforums.site'
    ],
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
      },
      '/images': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
      },
      '/avatar': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
      }
    }
  },
})

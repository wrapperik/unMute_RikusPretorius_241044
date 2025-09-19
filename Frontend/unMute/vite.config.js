import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],
  server: {
    // Proxy API calls during development so the frontend dev server forwards
    // requests to the Express backend. We also rewrite the path so that
    // fetch('/api/auth/register') becomes backend '/auth/register'.
    proxy: {
      '/api': {
        target: 'http://localhost:5050',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, '')
      }
    }
  }
})

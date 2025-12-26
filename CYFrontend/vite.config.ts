import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  // --- ADD THIS SERVER SECTION ---
  server: {
    proxy: {
      // This proxies any request starting with '/api'
      '/api': {
        target: 'http://localhost:8080', // Your backend server
        changeOrigin: true, // Recommended
      },
    },
  },
  // ---------------------------------
})
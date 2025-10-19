import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Read env from project root (.env)
export default defineConfig({
  envDir: '..',
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Helpful during local dev if you prefer proxying instead of using VITE_API_BASE_URL
      '/api': 'http://localhost:3001'
    }
  }
})



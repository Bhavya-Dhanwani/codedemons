import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // the Express API (server/) runs on :5000
    proxy: { '/api': 'http://localhost:5000', '/uploads': 'http://localhost:5000' },
  },
})

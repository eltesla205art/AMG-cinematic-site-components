import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // Three.js (~900 kB) lives in the lazily-imported Scene chunk, off the critical path.
    chunkSizeWarningLimit: 1100,
  },
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' so the build works from any static host path (GitHub Pages, Netlify, file preview)
export default defineConfig({
  base: './',
  plugins: [react()],
})

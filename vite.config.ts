import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // This tells Vite to resolve 'src/*' imports relative to the './src' folder
      'src': path.resolve(__dirname, './src'),
    },
  },
})
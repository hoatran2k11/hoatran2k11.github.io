import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './' => chạy được cả ở username.github.io lẫn username.github.io/ten-repo/
export default defineConfig({
  base: './',
  plugins: [react()],
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite ki configuration. React plugin enable karta hai.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true, // npm run dev par browser khud khul jayega
  },
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
<<<<<<< HEAD
=======
  server: {
    host: '0.0.0.0',
    port: 5173, // or your preferred port
  },
   alias: {
      'firebase/app': 'firebase/app',
      'firebase/messaging': 'firebase/messaging',
    },
  build: {
    outDir: 'dist', 
  },
>>>>>>> f71df190e18281f2f16661fb65e5d89f76e6c66b
})

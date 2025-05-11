import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'window', // Polyfill `global` to `window`
  },
  // HTTPS Server at IP address
  server: {
    host: '192.168.163.162',
    port: 5173,
    https: {
      key: './key.pem',
      cert: './cert.pem'
    }
  }
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: [
      'frontend-moamen1-dev.apps.rm3.7wse.p1.openshiftapps.com',
      '.openshiftapps.com'
    ]
  }
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  server: { 
    proxy: {
      "/api": {
        target: "http://localhost:8081",
        changeOrigin: true,
      },
    },
//    watch: { // нужно для hot-reload при использовании docker
//        usePolling: true,
//    }, 
//    host: true, // нужно, чтобы правильно работал маппинг портов в docker-контейнере
    strictPort: true, // необязательно
    port: 3000,
  },
  plugins: [react()],
})

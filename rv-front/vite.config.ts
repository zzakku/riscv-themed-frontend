import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import mkcert from 'vite-plugin-mkcert'
import fs from 'fs';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  base: "/riscv-themed-frontend",
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
    https:{
      key: fs.readFileSync(path.resolve(__dirname, 'cert.key')),
      cert: fs.readFileSync(path.resolve(__dirname, 'cert.crt')),
    },
  },
  plugins: [
    react(),
    mkcert(),
    VitePWA({ 
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,
      },
      manifest: {
        name: "RISC-V Assembly",
        short_name: "RISC-V",
        start_url: "/riscv-themed-frontend/",
        display: "standalone",
        background_color: "#fdfdfd",
        theme_color: "#003262",
        orientation: "portrait-primary",
        icons: [
          {
      	    "src": "/logo192.png",
      	    "type": "image/png", "sizes": "192x192"
          },
          {
      	    "src": "/logo512.png",
      	    "type": "image/png", "sizes": "512x512"
          }
        ],
      }
    }),
  ]
})

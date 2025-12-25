import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// import { VitePWA } from 'vite-plugin-pwa'
import mkcert from 'vite-plugin-mkcert'
import fs from 'fs'; // убрать при клонировании
import path from 'path'; // убрать при клонировании
import { BASE_PATH } from "./src/target_config"
import { internalIpV4 } from "internal-ip";

// Для локальной работы:

      // "/api": {
      //   target: "http//localhost:8081",
      //   changeOrigin: true,
      // },
// Для деплоя где-либо /api не проксируется

// https://vite.dev/config/
export default defineConfig({
  base: BASE_PATH,
  server: { 
    proxy: {
      // "/api": {
      //   target: "https://1afa8552089991.lhr.life",
      //   changeOrigin: true,
      // },
       "/api": {
         target: "http://localhost:8081",
         changeOrigin: true,
       },
      '/minio': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        secure: false,
      }
    },
//    watch: { // нужно для hot-reload при использовании docker
//        usePolling: true,
//    }, 
//    host: true, // нужно, чтобы правильно работал маппинг портов в docker-контейнере
    strictPort: true, // необязательно
    port: 3000,
    host: "0.0.0.0",
    hmr: {
      protocol: "ws",
      host: await internalIpV4(),
      port: 3000,
    },
    watch: {
      // 3. tell vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
    // https убрать при клонировании
    https:{
      key: fs.readFileSync(path.resolve(__dirname, 'cert.key')),
      cert: fs.readFileSync(path.resolve(__dirname, 'cert.crt')),
    },
  },
  plugins: [
    react(),
    mkcert(),
    // VitePWA({ 
    //   registerType: 'autoUpdate',
    //   devOptions: {
    //     enabled: true,
    //   },
    //   manifest: {
    //     name: "RISC-V Assembly",
    //     short_name: "RISC-V",
    //     start_url: "/riscv-themed-frontend/",
    //     display: "standalone",
    //     background_color: "#fdfdfd",
    //     theme_color: "#003262",
    //     orientation: "portrait-primary",
    //     icons: [
    //       {
    //   	    "src": "/logo192.png",
    //   	    "type": "image/png", "sizes": "192x192"
    //       },
    //       {
    //   	    "src": "/logo512.png",
    //   	    "type": "image/png", "sizes": "512x512"
    //       }
    //     ],
    //   }
    // }),
  ]
})

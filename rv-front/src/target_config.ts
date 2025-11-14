const target_tauri = true; // ПЕРЕКЛЮЧИТЬ, ЕСЛИ МЫ РАБОТАЕМ В TAURI

export const API_BASE_URL = target_tauri 
  ? 'http://192.168.1.36:8081/api'  // Для Tauri - прямой IP
  : '/api';                       // Для веб - proxy

export const IMAGE_BASE_URL = target_tauri
  ? 'http://192.168.1.36:9000'  // Для Tauri - прямой IP
  : '';                          // Для веб - относительные пути

export const BASE_PATH = target_tauri 
  ? '' 
  : "/riscv-themed-frontend";
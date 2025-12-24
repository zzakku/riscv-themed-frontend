const target_tauri = true; // ПЕРЕКЛЮЧИТЬ, ЕСЛИ МЫ РАБОТАЕМ В TAURI
const target_github_pages = false; // ПЕРЕКЛЮЧИСЬ, ЕСЛИ ТАРГЕТ - GITHUB PAGES

export const API_BASE_URL = target_tauri || target_github_pages
  ? 'http://192.168.1.37:8081/api'  // Для Tauri/GHP - прямой IP
  : '/api';                       // Для dev - proxy

export const IMAGE_BASE_URL = target_tauri || target_github_pages
  ? 'http://192.168.1.37:8081/minio'  // Для Tauri/GHP - прямой IP
  : '';                          // Для dev - относительные пути

export const BASE_PATH = target_tauri 
  ? '' 
  : "/riscv-themed-frontend";
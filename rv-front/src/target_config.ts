const target_tauri = false; // ПЕРЕКЛЮЧИТЬ, ЕСЛИ МЫ РАБОТАЕМ В TAURI
const target_github_pages = false; // ПЕРЕКЛЮЧИСЬ, ЕСЛИ ТАРГЕТ - GITHUB PAGES

export const API_BASE_URL = target_tauri || target_github_pages
  ? 'https://1afa8552089991.lhr.life/api'  // Для Tauri/GHP - прямой IP
  : '';                       // Для dev - proxy

export const IMAGE_BASE_URL = target_tauri || target_github_pages
  ? 'http://10.146.21.222:9000'  // Для Tauri/GHP - прямой IP
  : '';                          // Для dev - относительные пути

export const BASE_PATH = target_tauri 
  ? '' 
  : "/riscv-themed-frontend";
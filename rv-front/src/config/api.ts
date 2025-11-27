import { API_BASE_URL } from '../target_config.ts';

export const getApiBaseUrl = (): string => {
  return API_BASE_URL

  // // В Tauri — прямой URL, в браузере — относительный путь (проксируется)
  // const isTauri = typeof window !== 'undefined' && (window as any).TAURI !== undefined;
  // return isTauri ? 'http://10.146.21.222:8081/api' : '/api';
};

export const getTauriApiBaseUrl = (): string => {
  return 'http://10.146.21.222:8081';
};
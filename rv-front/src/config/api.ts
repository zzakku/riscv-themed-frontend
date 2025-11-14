export const getApiBaseUrl = (): string => {
  // В Tauri — прямой URL, в браузере — относительный путь (проксируется)
  const isTauri = typeof window !== 'undefined' && (window as any).TAURI !== undefined;
  return isTauri ? 'http://192.168.1.36:8081/api' : '/api';
};

export const getTauriApiBaseUrl = (): string => {
  return 'http://192.168.1.36:8081';
};
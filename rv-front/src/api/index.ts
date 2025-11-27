import { Api } from './Api';
import { API_BASE_URL } from '../target_config';

// Создаем экземпляр Api напрямую с настройками
export const api = new Api({
  baseURL: API_BASE_URL,
  // Другие настройки axios при необходимости
});

export default api;
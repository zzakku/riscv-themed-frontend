import { getApiBaseUrl } from '../config/api';

export interface Command {
  id: number;
  is_delete: boolean;
  com_name: string;
  fmt: string;
  rs_num: number;
  rd_num: number;
  description: string;
  img: string;
}


export interface Users {
  id: number;
  login: string;
  password: string; // обычно не отправляется на фронтенд, но на всякий случай
  is_moderator: boolean;
}

export interface Program {
  id: number;
  status: string;
  date_create: string; // Date в JS
  date_update: string;
  date_finish: string | null;
  creator_id: number | null;
  moderator_id: number | null;
  init_t1: number | null;
  init_t2: number | null;
  res_t1: number | null;
  res_t2: number | null;
  creator?: Users;
  moderator?: Users;
}

export interface CommandProgram {
  id: number;
  command_id: number;
  program_id: number;
  operand: number;
  command?: Command;
  program?: Program;
}

export interface SuccessResponse<T = any> {
  status: string;
  message: string;
  data: T;
}

export interface ErrorResponse {
  status: string;
  description: string;
}

const isTauri = typeof window !== 'undefined' && (window as any).TAURI !== undefined;

const API_BASE = getApiBaseUrl();

export const getCommandById = async (id: number): Promise<Command> => {
  try {
    const url = `${API_BASE}/commands/${id}`;
    let response: Response;

    if (isTauri) {
      const { fetch: tauriFetch } = await import('@tauri-apps/plugin-http');
      response = await tauriFetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } else {
      response = await fetch(url);
    }
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.reaction || data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const getAllCommands = async (query?: string): Promise<Command[]> => {
  try {
    const url = query 
      ? `${API_BASE}/commands?searchQuery=${query}` 
      : `${API_BASE}/reaction`;
    
    console.log('API Request:', url); 

    let response: Response;

    if (isTauri) {
      // Используем Tauri HTTP plugin
      const { fetch: tauriFetch } = await import('@tauri-apps/plugin-http');
      response = await tauriFetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } else {
      // Обычный fetch в браузере
      response = await fetch(url);
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();

    if (Array.isArray(data)) {
      return data;
    } else if (data && Array.isArray(data.reactions)) {
      return data.reactions;
    } else if (data && data.data && Array.isArray(data.data)) {
      return data.data;
    } else {
      console.warn('Unexpected API response format:', data);
      return [];
    }
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};
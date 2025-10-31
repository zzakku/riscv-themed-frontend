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

export const getCommandById = async (id: number): Promise<Command> => {
  return fetch(`/api/commands/${id}`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data: SuccessResponse<Command>) => {
      return data.data;
    });
};

export const getAllCommands = async (query?: string): Promise<Command[]> => {
  return fetch(`/api/commands?searchQuery=${query}`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data: SuccessResponse<Command[]>) => {
      return data.data;
    });
};
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api';
import type { UserState } from './userSlice';
import type { DsCommand, HandlerErrorResponse } from '../../api/Api';

interface CommandsState {
  commands: DsCommand[];
  currentCommand: DsCommand | null;
  loading: boolean;
  error: string | null;
}

const initialState: CommandsState = {
  commands: [],
  currentCommand: null,
  loading: false,
  error: null,
};

export const getCommands = createAsyncThunk(
  'commands/getCommands',
  async (filters: { query?: string } = {}, { rejectWithValue }) => {
    try {
      const response = await api.api.commandsList(filters.query);
      
      // Проверяем структуру ответа API
      if (response.data?.data && Array.isArray(response.data.data)) {
        return response.data.data as DsCommand[];
      } else if (Array.isArray(response.data)) {
        return response.data as DsCommand[];
      }
      
      return [];
    } catch (error: any) {
      const errorData = error.response?.data as HandlerErrorResponse;
      return rejectWithValue(errorData?.description || 'Ошибка загрузки команд');
    }
  }
);

export const getCommand = createAsyncThunk(
  'commands/getCommand',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await api.api.commandsDetail(id);
      
      // Проверяем структуру ответа API
      let commandData: DsCommand | null = null;
      
      if (response.data?.data && typeof response.data.data === 'object') {
        commandData = response.data.data as DsCommand;
      } else if (response.data && typeof response.data === 'object') {
        commandData = response.data as DsCommand;
      }
      
      if (!commandData) {
        return rejectWithValue('Команда не найдена');
      }
      
      return commandData;
    } catch (error: any) {
      const errorData = error.response?.data as HandlerErrorResponse;
      return rejectWithValue(errorData?.description || 'Ошибка загрузки команды');
    }
  }
);

export const addCommandToProgram = createAsyncThunk(
  'commands/addToProgram',
  async (commandId: number, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { users: UserState };
      const token = state.users.token;
      
      if (!token) {
        return rejectWithValue('Требуется авторизация');
      }

      const response = await api.api.commandsAddToProgramCreate(commandId, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error: any) {
      const errorData = error.response?.data as HandlerErrorResponse;
      return rejectWithValue(errorData?.description || 'Ошибка добавления в программу');
    }
  }
);

const commandsSlice = createSlice({
  name: 'commands',
  initialState,
  reducers: {
    clearCurrentCommand: (state) => {
      state.currentCommand = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCommands.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCommands.fulfilled, (state, action) => {
        state.loading = false;
        state.commands = action.payload;
      })
      .addCase(getCommands.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(getCommand.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCommand.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCommand = action.payload;
      })
      .addCase(getCommand.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(addCommandToProgram.pending, (state) => {
        state.loading = true;
      })
      .addCase(addCommandToProgram.fulfilled, (state) => {
        state.loading = false;
        // Можно добавить логику если нужно
      })
      .addCase(addCommandToProgram.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCurrentCommand, clearError } = commandsSlice.actions;
export default commandsSlice.reducer;
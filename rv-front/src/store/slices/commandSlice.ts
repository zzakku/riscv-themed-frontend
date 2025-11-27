import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api';
import type { UserState } from './userSlice'; // Импортируем тип
import type { DsCommand } from '../../api/Api';
// import type { HandlerCommandResponse } from '../../api/Api'; // Импортируем тип из API

// // Используем тип из API вместо кастомного интерфейса
// type Command = HandlerCommandResponse;

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
  async (filters: { query?: string; } = {}, { rejectWithValue }) => {
    try {
      const response = await api.api.commandsList(filters.query);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Ошибка загрузки команд');
    }
  }
);

export const getCommand = createAsyncThunk(
  'commands/getCommand',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await api.api.commandsDetail(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Ошибка загрузки команды');
    }
  }
);

export const addCommandToProgram = createAsyncThunk(
  'commands/addToProgram',
  async ({ commandId }: { commandId: number; }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { user: UserState };
      const token = state.user.token;
      
      if (!token) {
        return rejectWithValue('Требуется авторизация');
      }

      const response = await api.api.commandsAddToProgramCreate(
        commandId,
        {
          secure: true,
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Ошибка добавления в программу');
    }
  }
);

const commandsSlice = createSlice({
  name: 'commands',
  initialState,
  reducers: {
    clearCurrentCommand: (state) => {
      state.currentCommand = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCommands.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCommands.fulfilled, (state, action) => {
        state.loading = false;
        state.commands = action.payload.data as DsCommand[];
      })
      .addCase(getCommands.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(getCommand.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCommand.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCommand = action.payload.data as DsCommand;
      })
      .addCase(getCommand.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCurrentCommand } = commandsSlice.actions;
export default commandsSlice.reducer;
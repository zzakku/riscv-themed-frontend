import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api';
import type { UserState } from './userSlice';
import { type HandlerOperandReq } from '../../api/Api';

interface DraftProgramState {
  cartCount: number;
  programId: number | null;
  loading: boolean;
  error: string | null;
}

const initialState: DraftProgramState = {
  cartCount: 0,
  programId: -1,  
  loading: false,
  error: null,
};

export const getDraftProgram = createAsyncThunk(
  'draftProgram/getDraftProgram',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { users: UserState };
      const token = state.users.token;
      
      if (!token) {
        return rejectWithValue('Требуется авторизация');
      }

      const response = await api.api.programsCartIconList({
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.description || 'Ошибка загрузки корзины');
    }
  }
);

export const addCommandToProgram = createAsyncThunk(
  'draftProgram/adProgram',
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
      return rejectWithValue(error.response?.data?.description || 'Ошибка добавления команды в программу');
    }
  }
);

export const updateCommandOperand = createAsyncThunk(
  'draftProgram/updateCommandOperand',
  async ({ 
    commandId, 
    operand 
  }: { 
    commandId: number; 
    operand: number 
  }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { users: UserState };
      const token = state.users.token;
      
      if (!token) {
        return rejectWithValue('Требуется авторизация');
      }

      const request: HandlerOperandReq = { operand };

      console.log('Updating operand:', request); // Для отладки
      
      const response = await api.api.commandsProgramsUpdate(
        { command_id: commandId },
        request,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return { response: response.data, commandId, operand };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.description || 'Ошибка обновления операнда');
    }
  }
);

export const removeCommandFromProgram = createAsyncThunk(
  'draftProgram/removeCommandFromProgram',
  async ({ commandId }: { commandId: number }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { users: UserState };
      const token = state.users.token;
      
      if (!token) {
        return rejectWithValue('Требуется авторизация');
      }

      const response = await api.api.commandsProgramsDelete(
        { command_id: commandId },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return { response: response.data, commandId };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.description || 'Ошибка удаления команды');
    }
  }
);

export const deleteDraftProgram = createAsyncThunk(
  'draftProgram/deleteDraftProgram',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { users: UserState };
      const token = state.users.token;
      
      if (!token) {
        return rejectWithValue('Требуется авторизация');
      }

      const response = await api.api.programsDelete({
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.description || 'Ошибка удаления черновика');
    }
  }
);

const draftProgramSlice = createSlice({
  name: 'draftProgram',
  initialState,
  reducers: {
    clearDraft: (state) => {
      state.cartCount = 0;
      state.programId = -1;  
      state.error = null;
    },
    updateCartCount: (state, action) => {
      state.cartCount = action.payload;
    },
    setProgramId: (state, action) => {
      state.programId = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getDraftProgram.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDraftProgram.fulfilled, (state, action) => {
        state.loading = false;
        state.cartCount = action.payload.data?.count || 0;
        state.programId = action.payload.data?.prg_id ?? -1;
      })
      .addCase(getDraftProgram.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(removeCommandFromProgram.fulfilled, (state) => {
        // После удаления команды уменьшаем счетчик
        if (state.cartCount > 0) {
          state.cartCount -= 1;
        }
        // Если команд не осталось, сбрасываем programId на -1
        if (state.cartCount === 0) {
          state.programId = -1;  
        }
      })
      .addCase(deleteDraftProgram.fulfilled, (state) => {
        // После удаления черновика сбрасываем состояние
        state.cartCount = 0;
        state.programId = -1;  
        state.error = null;
      })
      .addCase(deleteDraftProgram.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearDraft, updateCartCount, setProgramId } = draftProgramSlice.actions;
export default draftProgramSlice.reducer;
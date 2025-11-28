import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api';
import type { UserState } from './userSlice';
import { type HandlerModifyProgramFieldsReq } from '../../api/Api';

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
      const state = getState() as { user: UserState };
      const token = state.user.token;
      
      if (!token) {
        return rejectWithValue('Требуется авторизация');
      }

      const response = await api.api.programsCartIconList({
        secure: true,
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Ошибка загрузки корзины');
    }
  }
);

export const updateProgramScenario = createAsyncThunk(
  'draftProgram/updateProgramScenario',
  async ({ 
    programId, 
    updateData 
  }: { 
    programId: number; 
    updateData: HandlerModifyProgramFieldsReq 
  }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { user: UserState };
      const token = state.user.token;
      
      if (!token) {
        return rejectWithValue('Требуется авторизация');
      }

      const response = await api.api.programsUpdate(
        programId, 
        updateData, 
        {
          secure: true,
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Ошибка обновления сценария');
    }
  }
);

export const removeCommandFromProgram = createAsyncThunk(
  'draftProgram/removeCommandFromProgram',
  async ({ commandId }: { commandId: number }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { user: UserState };
      const token = state.user.token;
      
      if (!token) {
        return rejectWithValue('Требуется авторизация');
      }

      const response = await api.api.commandsProgramsDelete( {command_id: commandId}, {
        secure: true,
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return { response, commandId };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Ошибка удаления команды');
    }
  }
);

const draftProgramSlice = createSlice({
  name: 'draftProgram',
  initialState,
  reducers: {
    clearDraft: (state) => {
      state.cartCount = 0;
      state.programId = null;
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
        state.cartCount = action.payload.data.data?.count || 0;
        state.programId = action.payload.data.data?.prg_id || null;
      })
      .addCase(getDraftProgram.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(removeCommandFromProgram.fulfilled, (state) => {
        // После удаления сценария уменьшаем счетчик
        if (state.cartCount > 0) {
          state.cartCount -= 1;
        }
        // Если сценариев не осталось, сбрасываем programId
        if (state.cartCount === 0) {
          state.programId = null;
        }
      });
  },
});

export const { clearDraft, updateCartCount, setProgramId } = draftProgramSlice.actions;
export default draftProgramSlice.reducer;
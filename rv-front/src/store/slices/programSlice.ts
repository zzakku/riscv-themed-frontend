import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api';
import type { UserState } from './userSlice';
import type { HandlerModifyProgramFieldsReq, HandlerProgramResp } from '../../api/Api'; // Импортируем тип из API

// Используем тип из API вместо кастомного интерфейса
type Program = HandlerProgramResp;



interface ProgramsState {
  programs: Program[];
  currentProgram: Program | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProgramsState = {
  programs: [],
  currentProgram: null,
  loading: false,
  error: null,
};

export const getPrograms = createAsyncThunk(
  'programs/getPrograms',
  async (filters: { status: string; start_date: string; end_date: string } = {
      status: '',
      start_date: '',
      end_date: ''
  }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { user: UserState };
      const token = state.user.token;
      
      if (!token) {
        return rejectWithValue('Требуется авторизация');
      }

      const response = await api.api.programsList(filters, {
        secure: true,
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Ошибка загрузки заявок');
    }
  }
);

export const getProgram = createAsyncThunk(
  'programs/getProgram',
  async (programId: number, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { user: UserState };
      const token = state.user.token;
      
      if (!token) {
        return rejectWithValue('Требуется авторизация');
      }

      const response = await api.api.programsDetail(programId, {
        secure: true,
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Ошибка загрузки заявки');
    }
  }
);

export const updateProgram = createAsyncThunk(
  'programs/updateProgram',
  async (
    { 
      programId, 
      updateData 
    }: { 
      programId: number; 
      updateData: HandlerModifyProgramFieldsReq
    }, 
    { getState, rejectWithValue }
  ) => {
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
      return rejectWithValue(error.response?.data?.error || 'Ошибка обновления заявки');
    }
  }
);

export const submitProgram = createAsyncThunk(
  'programs/submitProgram',
  async (programId: number, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { user: UserState };
      const token = state.user.token;
      
      if (!token) {
        return rejectWithValue('Требуется авторизация');
      }

      const response = await api.api.programsSubmitUpdate(programId, {
        secure: true,
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Ошибка отправки заявки');
    }
  }
);

export const deleteProgram = createAsyncThunk(
  'programs/deleteProgram',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { user: UserState };
      const token = state.user.token;
      
      if (!token) {
        return rejectWithValue('Требуется авторизация');
      }

      const response = await api.api.programsDelete({
        secure: true,
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Ошибка удаления заявки');
    }
  }
);

const programsSlice = createSlice({
  name: 'programs',
  initialState,
  reducers: {
    clearCurrentProgram: (state) => {
      state.currentProgram = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getPrograms.pending, (state) => {
        state.loading = true;
      })
      .addCase(getPrograms.fulfilled, (state, action) => {
        state.loading = false;
        state.programs = action.payload.data as Program[];
      })
      .addCase(getPrograms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(getProgram.pending, (state) => {
        state.loading = true;
      })
      .addCase(getProgram.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProgram = action.payload.data as Program;
      })
      .addCase(getProgram.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCurrentProgram } = programsSlice.actions;
export default programsSlice.reducer;
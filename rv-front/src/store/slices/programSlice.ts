import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api';
import type { UserState } from './userSlice';
import type { HandlerModifyProgramFieldsReq, HandlerProgramCmdsResp, HandlerProgramResp } from '../../api/Api';

interface ProgramsState {
  programs: HandlerProgramResp[];
  currentProgram: HandlerProgramCmdsResp | null;
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
  async (filters: { status?: string; start_date?: string; end_date?: string } = {}, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { users: UserState };
      const token = state.users.token;
      
      console.log('Token:', token); // для отладки
      console.log('Filters:', filters); // для отладки
      
      if (!token) {
        console.error('No token found');
        return rejectWithValue('Требуется авторизация');
      }

      const response = await api.api.programsList(filters, {
        secure: true,
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('Response data:', response.data); // для отладки
      return response.data;
    } catch (error: any) {
      console.error('Error in getPrograms:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      // Исправьте обработку ошибки
      if (error.response?.data?.description) {
        return rejectWithValue(error.response.data.description);
      } else if (error.response?.data?.error) {
        return rejectWithValue(error.response.data.error);
      } else if (error.message) {
        return rejectWithValue(error.message);
      } else {
        return rejectWithValue('Ошибка загрузки заявок');
      }
    }
  }
);


export const getProgram = createAsyncThunk(
  'programs/getProgram',
  async (programId: number, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { users: UserState };
      const token = state.users.token;
      
      if (!token) {
        return rejectWithValue('Требуется авторизация');
      }

      const response = await api.api.programsDetail(programId, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.description || 'Ошибка загрузки заявки');
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
      const state = getState() as { users: UserState };
      const token = state.users.token;
      
      if (!token) {
        return rejectWithValue('Требуется авторизация');
      }


      const payload = {
        init_t1: updateData.init_t1 ?? 0,
        init_t2: updateData.init_t2 ?? 0
      };

      const response = await api.api.programsUpdate(
        programId, 
        payload, 
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.description || 'Ошибка обновления заявки');
    }
  }
);

export const submitProgram = createAsyncThunk(
  'programs/submitProgram',
  async (programId: number, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { users: UserState };
      const token = state.users.token;
      
      if (!token) {
        return rejectWithValue('Требуется авторизация');
      }

      const response = await api.api.programsSubmitUpdate(programId, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.description || 'Ошибка отправки заявки');
    }
  }
);

export const deleteProgramById = createAsyncThunk(
  'programs/deleteProgramById',
  async (programId: number, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { users: UserState };
      const token = state.users.token;
      
      if (!token) {
        return rejectWithValue('Требуется авторизация');
      }

      // Используем переменную programId чтобы избежать предупреждения
      console.log('Попытка удаления программы с ID:', programId);
      
      return rejectWithValue('Метод удаления программы по ID не реализован');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.description || 'Ошибка удаления заявки');
    }
  }
);

// store/slices/programSlice.ts
export const moderateProgram = createAsyncThunk(
  'programs/moderateProgram',
  async (
    { programId, is_accepted }: { programId: number; is_accepted: boolean },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as { users: UserState };
      const token = state.users.token;
      
      if (!token) {
        return rejectWithValue('Требуется авторизация');
      }

      const response = await api.api.programsModerateUpdate(
        programId,
        { is_accepted },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.description || 'Ошибка модерации программы');
    }
  }
);

const programsSlice = createSlice({
  name: 'programs',
  initialState,
  reducers: {
    clearCurrentProgram: (state) => {
      state.currentProgram = null;
    },
    setCurrentProgram: (state, action) => {
      state.currentProgram = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
    .addCase(getPrograms.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(getPrograms.fulfilled, (state, action) => {
      state.loading = false;
      
      // action.payload содержит { status: "success", programs: [...] }
      const response = action.payload;
      
      if (response && response.status === "success" && Array.isArray(response.data)) {
        // Сохраняем только массив программ
        state.programs = response.data;
      } else {
        state.programs = [];
      }
    })
    .addCase(getPrograms.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })
      .addCase(getProgram.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProgram.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProgram = action.payload;
      })
      .addCase(getProgram.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateProgram.fulfilled, (state, action) => {
        if (state.currentProgram?.program?.id === action.payload.program?.id) {
          state.currentProgram = action.payload;
        }
        // Также обновляем в списке программ
        const updatedIndex = state.programs.findIndex(
          p => p.id === action.payload.program?.id
        );
        if (updatedIndex !== -1 && action.payload.program) {
          state.programs[updatedIndex] = action.payload.program;
        }
      })
      .addCase(submitProgram.fulfilled, (state, action) => {
        const programId = action.meta.arg;
        
        // Обновляем текущую программу
        if (state.currentProgram?.program?.id === programId) {
          state.currentProgram.program!.status = 'pending';
        }
        
        // Обновляем в списке
        const programIndex = state.programs.findIndex(
          p => p.id === programId
        );
        if (programIndex !== -1 && state.programs[programIndex]) {
          state.programs[programIndex].status = 'pending';
        }
      })
        // Добавьте обработчик в extraReducers
        .addCase(moderateProgram.fulfilled, (state, action) => {
        // Обновляем программу в списке
        const updatedProgram = action.payload;
        const index = state.programs.findIndex(p => p.id === updatedProgram.program?.id);
        if (index !== -1) {
          state.programs[index] = updatedProgram;
        }
      });
  },
});

export const { clearCurrentProgram, setCurrentProgram } = programsSlice.actions;
export default programsSlice.reducer;
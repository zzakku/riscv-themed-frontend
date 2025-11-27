import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api';


interface AuthResponse {
  user: {
    id: number;
    login: string;
    is_moderator: boolean;
  };
  token: string;
}


// Определяем интерфейс для состояния пользователя
export interface UserState {
  user: {
    id: number;
    login: string;
    is_moderator: boolean;
  } | null;
  token: string | null;
  isAuthenticated: boolean;
  error: string | null;
  loading: boolean;
}

const initialState: UserState = {
  user: null,
  token: null,
  isAuthenticated: false,
  error: null,
  loading: false,
};

export const loginUser = createAsyncThunk(
  'user/login',
  async (credentials: { login: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await api.api.usersLogInCreate(credentials);
      // Приводим тип к ожидаемому формату ответа
      return response as unknown as AuthResponse;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Ошибка авторизации');
    }
  }
);

export const registerUser = createAsyncThunk(
  'user/register',
  async (userData: { login: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await api.api.usersRegisterCreate(userData);
      // Предполагаем, что регистрация возвращает тот же формат
      return response as unknown as AuthResponse;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Ошибка регистрации');
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'user/updateProfile',
  async (userData: { login?: string, password?: string }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { user: UserState };
      const token = state.user.token;
      
      if (!token) {
        return rejectWithValue('Требуется авторизация');
      }

      const response = await api.api.usersUpdate(userData, {
        secure: true,
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Ошибка обновления профиля');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'user/logout',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { user: UserState };
      const token = state.user.token;
      
      if (!token) {
        return rejectWithValue('Требуется авторизация');
      }

      const response = await api.api.usersLogOutCreate({
        secure: true,
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Ошибка выхода');
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  
    setTokenFromStorage: (state, action) => {
      state.token = action.payload;
      state.isAuthenticated = true;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        // Предполагаем, что ответ содержит user и token
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        localStorage.setItem('token', action.payload.token);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        localStorage.removeItem('token');
      });
  },
});

export const { clearError, setTokenFromStorage } = userSlice.actions;
export default userSlice.reducer;
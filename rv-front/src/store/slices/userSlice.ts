import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api';
import type { HandlerRegisterRequest, HandlerUserPutReq, HandlerErrorResponse } from '../../api/Api';

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

// Вспомогательная функция для получения данных пользователя через API
const getUserData = createAsyncThunk(
  'user/getUserData',
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await api.api.usersProfileList({
        secure: true,
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data?.status === 'success' && response.data?.user) {
        const userData = response.data.user as any;
        return {
          user: {
            id: userData.id || 0,
            login: userData.login || '',
            is_moderator: userData.is_moderator || false
          },
          token
        };
      }
      return rejectWithValue('Не удалось получить данные пользователя');
    } catch (error: any) {
      const errorData = error.response?.data as HandlerErrorResponse;
      return rejectWithValue(errorData?.description || 'Ошибка загрузки данных пользователя');
    }
  }
);

export const loginUser = createAsyncThunk(
  'user/login',
  async (credentials: { login: string; password: string }, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.api.usersLogInCreate(credentials);
      
      if (response.data?.access_token) {
        const token = response.data.access_token;
        
        // Сохраняем токен
        localStorage.setItem('token', token);
        
        // Получаем данные пользователя через API
        const userResponse = await dispatch(getUserData(token));
        
        if (userResponse.type === getUserData.fulfilled.type) {
          return {
            token,
            user: (userResponse.payload as any).user
          };
        } else {
          return rejectWithValue('Не удалось получить данные пользователя');
        }
      } else {
        return rejectWithValue('Токен не получен');
      }
    } catch (error: any) {
      const errorData = error.response?.data as HandlerErrorResponse;
      return rejectWithValue(errorData?.description || 'Ошибка авторизации');
    }
  }
);

export const registerUser = createAsyncThunk(
  'user/register',
  async (userData: HandlerRegisterRequest, { rejectWithValue }) => {
    try {
      const response = await api.api.usersRegisterCreate(userData);
      
      if (response.data?.status === 'success') {
        return { 
          message: 'Регистрация успешна. Теперь вы можете войти.' 
        };
      } else {
        const errorData = response.data as HandlerErrorResponse;
        return rejectWithValue(errorData?.description || 'Ошибка регистрации');
      }
    } catch (error: any) {
      const errorData = error.response?.data as HandlerErrorResponse;
      return rejectWithValue(errorData?.description || 'Ошибка регистрации');
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'user/updateProfile',
  async (userData: HandlerUserPutReq, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { users: UserState };
      const token = state.users.token;
      
      if (!token) {
        return rejectWithValue('Требуется авторизация');
      }

      const response = await api.api.usersProfileUpdate(userData, {
        secure: true,
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data?.status === 'success') {
        // После успешного обновления получаем обновленные данные пользователя
        const updatedUserResponse = await api.api.usersProfileList({
          secure: true,
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (updatedUserResponse.data?.status === 'success' && updatedUserResponse.data?.user) {
          const userData = updatedUserResponse.data.user as any;
          return {
            id: userData.id || 0,
            login: userData.login || '',
            is_moderator: userData.is_moderator || false
          };
        }
        return state.users;
      } else {
        const errorData = response.data as HandlerErrorResponse;
        return rejectWithValue(errorData?.description || 'Ошибка обновления профиля');
      }
    } catch (error: any) {
      const errorData = error.response?.data as HandlerErrorResponse;
      return rejectWithValue(errorData?.description || 'Ошибка обновления профиля');
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
      
      return response.data;
    } catch (error: any) {
      // Даже если ошибка API, всё равно разлогиниваем пользователя локально
      console.error('Ошибка при выходе:', error);
      return { status: 'success', message: 'Вы успешно вышли из системы' };
    }
  }
);

// Thunk для восстановления сессии из localStorage
export const restoreSession = createAsyncThunk(
  'user/restoreSession',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return rejectWithValue('Токен не найден');
      }
      
      // Проверяем токен, запрашивая данные пользователя
      const userResponse = await dispatch(getUserData(token));
      
      if (userResponse.type === getUserData.fulfilled.type) {
        return {
          token,
          user: (userResponse.payload as any).user
        };
      } else {
        localStorage.removeItem('token');
        return rejectWithValue('Сессия устарела или токен недействителен');
      }
    } catch (error: any) {
      localStorage.removeItem('token');
      return rejectWithValue('Ошибка восстановления сессии');
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
      // Пользователь будет установлен после успешного запроса к API
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
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Profile
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && state.user) {
          state.user = { ...state.user, ...action.payload };
        }
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Logout
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
        localStorage.removeItem('token');
      })
      .addCase(logoutUser.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
        localStorage.removeItem('token');
      })
      // Restore Session
      .addCase(restoreSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(restoreSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });
  },
});

export const { clearError, setTokenFromStorage } = userSlice.actions;
export default userSlice.reducer;
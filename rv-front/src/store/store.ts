import { configureStore } from '@reduxjs/toolkit';
import filterReducer from './filterSlice';
import userReducer from './slices/userSlice'

const enableDevTools = true; 

export const store = configureStore({
  reducer: {
    filters: filterReducer,
    users: userReducer,
  },
  devTools: enableDevTools,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
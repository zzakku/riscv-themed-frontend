import { configureStore } from '@reduxjs/toolkit';
import filterReducer from './filterSlice';

const enableDevTools = true; 

export const store = configureStore({
  reducer: {
    filters: filterReducer,
  },
  devTools: enableDevTools,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
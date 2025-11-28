import { configureStore } from '@reduxjs/toolkit';
import filterReducer from './filterSlice';
import userReducer from './slices/userSlice';
import commandsReducers from './slices/commandSlice'
import draftProgramReducer from './slices/programDraftSlice'

const enableDevTools = true; 

export const store = configureStore({
  reducer: {
    filters: filterReducer,
    users: userReducer,
    commands: commandsReducers,
    draftProgram: draftProgramReducer,
  },
  devTools: enableDevTools,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
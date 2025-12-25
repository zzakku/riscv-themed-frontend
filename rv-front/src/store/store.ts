import { configureStore } from '@reduxjs/toolkit';
import filterReducer from './slices/filterSlice';
import userReducer from './slices/userSlice';
import commandsReducers from './slices/commandSlice'
import programsReducer from './slices/programSlice'
import draftProgramReducer from './slices/programDraftSlice'

const enableDevTools = true; 

export const store = configureStore({
  reducer: {
    filters: filterReducer,
    users: userReducer,
    commands: commandsReducers,
    programs: programsReducer,
    draftProgram: draftProgramReducer,
  },
  devTools: enableDevTools,
});

export const selectCommands = (state: RootState) => state.commands.commands;
export const selectCommandsLoading = (state: RootState) => state.commands.loading;
export const selectCommandsError = (state: RootState) => state.commands.error;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
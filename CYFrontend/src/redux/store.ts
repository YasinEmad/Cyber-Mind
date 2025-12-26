
import { configureStore } from '@reduxjs/toolkit';
import puzzleReducer from './slices/puzzleSlice';
import userReducer from './slices/userSlice';

export const store = configureStore({
  reducer: {
    puzzles: puzzleReducer,
    user: userReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

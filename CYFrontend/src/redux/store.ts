
import { configureStore } from '@reduxjs/toolkit';
import puzzleReducer from './slices/puzzleSlice';
import userReducer from './slices/userSlice';
import challengeReducer from './slices/challengeSlice';

export const store = configureStore({
  reducer: {
    puzzles: puzzleReducer,
    user: userReducer,
    challenges: challengeReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

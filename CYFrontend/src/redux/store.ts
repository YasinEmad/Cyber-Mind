
import { configureStore } from '@reduxjs/toolkit';
import puzzleReducer from './slices/puzzleSlice';
import userReducer from './slices/userSlice';
import challengeReducer from './slices/challengeSlice';
import ctfReducer from './slices/ctfSlice';

export const store = configureStore({
  reducer: {
    puzzles: puzzleReducer,
    user: userReducer,
    challenges: challengeReducer,
    ctf: ctfReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

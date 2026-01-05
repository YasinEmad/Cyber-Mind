import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';

interface Profile {
  rating: number;
  puzzlesDone: number;
  challengesDone: number;
  flags: number;
  totalScore: number;
  globalRank: number;
}

interface User {
  uid: string;
  email: string;
  name: string;
  photoURL: string;
  role?: string;
  profile: Profile;
}

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}

const initialState: UserState = {
  user: null,
  isAuthenticated: false,
  loading: true,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
    },
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setUser, clearUser, setLoading } = userSlice.actions;

export const selectUser = (state: RootState) => state.user.user;
export const selectIsAuthenticated = (state: RootState) => state.user.isAuthenticated;
export const selectLoading = (state: RootState) => state.user.loading;
export const selectIsAdmin = (state: RootState) => state.user.user?.role === 'admin';

export default userSlice.reducer;
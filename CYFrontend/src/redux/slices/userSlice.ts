import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';

const normalizeSolvedCTFLevels = (value: any): any[] => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

const normalizeUser = (user: User): User => {
  const solvedPuzzles = Array.isArray(user.profile?.solvedPuzzles)
    ? user.profile.solvedPuzzles
    : Array.isArray(user.solvedPuzzles)
    ? user.solvedPuzzles
    : [];

  const solvedChallenges = Array.isArray(user.profile?.solvedChallenges)
    ? user.profile.solvedChallenges
    : Array.isArray(user.solvedChallenges)
    ? user.solvedChallenges
    : [];

  return {
    ...user,
    profile: {
      ...user.profile,
      rating: user.profile?.rating || 0,
      puzzlesDone: user.profile?.puzzlesDone || 0,
      challengesDone: user.profile?.challengesDone || 0,
      flags: user.profile?.flags || 0,
      totalScore: user.profile?.totalScore || 0,
      globalRank: user.profile?.globalRank || 0,
      solvedPuzzles,
      solvedChallenges,
      solvedCTFLevels: normalizeSolvedCTFLevels(user.profile?.solvedCTFLevels),
    },
  };
};

interface Profile {
  rating: number;
  puzzlesDone: number;
  challengesDone: number;
  flags: number;
  totalScore: number;
  globalRank: number;
  avatar?: string;
  solvedPuzzles?: number[];
  solvedChallenges?: number[];
  solvedCTFLevels?: Array<{
    levelId: number;
    level: number;
    title: string;
    difficulty: string;
    pointsAwarded: number;
    completedAt: string;
  }>;
}

interface User {
  uid: string;
  email: string;
  name: string;
  photoURL: string;
  role?: string;
  solvedPuzzles?: number[];
  solvedChallenges?: number[];
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
      state.user = normalizeUser(action.payload);
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
    updateUserProfileFromCTF: (state, action: PayloadAction<{ flags: number; totalScore: number; globalRank: number; solvedCTFLevels?: any[] }>) => {
      if (state.user && state.user.profile) {
        state.user.profile.flags = action.payload.flags;
        state.user.profile.totalScore = action.payload.totalScore;
        state.user.profile.globalRank = action.payload.globalRank;
        if (action.payload.solvedCTFLevels) {
          state.user.profile.solvedCTFLevels = action.payload.solvedCTFLevels;
        }
      }
    },
    addCompletedLevel: (state, action: PayloadAction<number>) => {
      if (state.user && !state.user.solvedChallenges) {
        state.user.solvedChallenges = [];
      }
      if (state.user && !state.user.solvedChallenges?.includes(action.payload)) {
        state.user.solvedChallenges?.push(action.payload);
      }
    },
  },
});

export const { setUser, clearUser, setLoading, updateUserProfileFromCTF, addCompletedLevel } = userSlice.actions;

export const selectUser = (state: RootState) => state.user.user;
export const selectIsAuthenticated = (state: RootState) => state.user.isAuthenticated;
export const selectLoading = (state: RootState) => state.user.loading;
export const selectIsAdmin = (state: RootState) => state.user.user?.role === 'admin';

export default userSlice.reducer;
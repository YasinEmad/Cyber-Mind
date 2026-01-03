import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import * as challengesApi from '@/api/challenges'

export interface Challenge {
  _id: string
  id?: string
  title: string
  description?: string
  code?: string
  level: 'easy' | 'medium' | 'hard'
  hints?: string[]
  challengeDetails?: string
  recommendation?: string
  feedback?: string
  points?: number
  createdAt?: string
}

interface ChallengeState {
  challenges: Challenge[]
  challenge: Challenge | null
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}

const initialState: ChallengeState = {
  challenges: [],
  challenge: null,
  status: 'idle',
  error: null
}

export const fetchChallenges = createAsyncThunk<Challenge[]>(
  'challenges/fetchAll',
  async () => {
    return await challengesApi.fetchChallenges()
  }
)

export const fetchChallengeById = createAsyncThunk<Challenge, string>(
  'challenges/fetchById',
  async (id) => {
    return await challengesApi.fetchChallengeById(id)
  }
)

const slice = createSlice({
  name: 'challenges',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchChallenges.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchChallenges.fulfilled, (state, action: PayloadAction<Challenge[]>) => {
        state.status = 'succeeded'
        state.challenges = action.payload
      })
      .addCase(fetchChallenges.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? null
      })

      .addCase(fetchChallengeById.pending, (state) => {
        state.status = 'loading'
        state.challenge = null
      })
      .addCase(fetchChallengeById.fulfilled, (state, action: PayloadAction<Challenge>) => {
        state.status = 'succeeded'
        state.challenge = action.payload
      })
      .addCase(fetchChallengeById.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? null
      })
  }
})

export default slice.reducer

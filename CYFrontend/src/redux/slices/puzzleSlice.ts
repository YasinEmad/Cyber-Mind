import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import axios from 'axios'

const API_URL = 'http://localhost:8080/api/puzzles'

export interface Puzzle {
  _id: string
  title: string
  description: string
  level: number
  hints: string[]
  answer?: string // <-- FIX: Make the answer optional
  animation_url?: string
  scenario: string
  category: string
  active: boolean
  createdAt?: string
  updatedAt?: string
}


interface PuzzleState {
  puzzles: Puzzle[]
  puzzle: Puzzle | null
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}

const initialState: PuzzleState = {
  puzzles: [],
  puzzle: null,
  status: 'idle',
  error: null,
}

// 1. Get all puzzles
export const fetchPuzzles = createAsyncThunk<Puzzle[]>(
  'puzzles/fetchAll',
  async () => {
    const res = await axios.get(API_URL)
    return res.data
  }
)

// 2. Get puzzle by id
export const fetchPuzzleById = createAsyncThunk<Puzzle, string>(
  'puzzles/fetchById',
  async (id) => {
    const res = await axios.get(`${API_URL}/${id}`)
    return res.data
  }
)

// 3. Create puzzle
export const createPuzzle = createAsyncThunk<Puzzle, Omit<Puzzle, '_id'>>(
  'puzzles/create',
  async (newPuzzle) => {
    const res = await axios.post(API_URL, newPuzzle)
    return res.data
  }
)

// 4. Update puzzle
export const updatePuzzle = createAsyncThunk<
  Puzzle,
  { id: string; updatedData: Partial<Puzzle> }
>('puzzles/update', async ({ id, updatedData }) => {
  const res = await axios.put(`${API_URL}/${id}`, updatedData)
  return res.data
})

// 5. Delete puzzle
export const deletePuzzle = createAsyncThunk<string, string>(
  'puzzles/delete',
  async (id) => {
    await axios.delete(`${API_URL}/${id}`)
    return id
  }
)

const puzzleSlice = createSlice({
  name: 'puzzles',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // ... (fetchPuzzles cases) ...
      .addCase(fetchPuzzles.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchPuzzles.fulfilled, (state, action: PayloadAction<Puzzle[]>) => {
        state.status = 'succeeded'
        state.puzzles = action.payload
      })
      .addCase(fetchPuzzles.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? null
      })

      // --- MODIFIED: Added pending/rejected for single puzzle fetch ---
      .addCase(fetchPuzzleById.pending, (state) => {
        state.status = 'loading'
        state.puzzle = null // Clear previous puzzle
      })
      .addCase(fetchPuzzleById.fulfilled, (state, action: PayloadAction<Puzzle>) => {
        state.status = 'succeeded'
        state.puzzle = action.payload
      })
      .addCase(fetchPuzzleById.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? null
      })
      // -----------------------------------------------------------

      .addCase(createPuzzle.fulfilled, (state, action: PayloadAction<Puzzle>) => {
        state.status = 'succeeded'
        state.puzzles.push(action.payload)
      })
    // ... (rest of the slice) ...
  },
})

export default puzzleSlice.reducer

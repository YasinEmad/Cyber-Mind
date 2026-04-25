import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import axios from '@/api/axios'

const API_URL = '/puzzles'

export interface Puzzle {
  id: number
  title: string
  description: string
  tags: string[]
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
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(API_URL)
      return res.data
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to fetch puzzles';
      return rejectWithValue(errorMsg);
    }
  }
)

// 2. Get puzzle by id
export const fetchPuzzleById = createAsyncThunk<Puzzle, string>(
  'puzzles/fetchById',
  async (id, { rejectWithValue }) => {
    // Validate that ID is provided and not 'undefined'
    if (!id || id === 'undefined' || (typeof id === 'string' && id.trim() === '')) {
      return rejectWithValue('Invalid puzzle ID');
    }
    
    try {
      const res = await axios.get(`${API_URL}/${id}`)
      return res.data
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to fetch puzzle';
      return rejectWithValue(errorMsg);
    }
  }
)

// 3. Create puzzle
export const createPuzzle = createAsyncThunk<Puzzle, Omit<Puzzle, '_id'>>(
  'puzzles/create',
  async (newPuzzle, { rejectWithValue }) => {
    try {
      // ensure level is numeric before sending
      const payload = { ...newPuzzle, level: Number((newPuzzle as any).level) };
      try { console.debug('createPuzzle thunk: level typeof:', typeof payload.level, 'value:', payload.level); } catch (e) {}
      const res = await axios.post(API_URL, payload)
      return res.data
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to create puzzle';
      return rejectWithValue(errorMsg);
    }
  }
)

// 4. Update puzzle
export const updatePuzzle = createAsyncThunk<
  Puzzle,
  { id: string; updatedData: Partial<Puzzle> }
>('puzzles/update', async ({ id, updatedData }, { rejectWithValue }) => {
  try {
    const payload = { ...updatedData } as any;

    if (payload.level !== undefined && payload.level !== null) {
      payload.level = Number(payload.level);
      console.debug('updatePuzzle thunk: level typeof:', typeof payload.level, 'value:', payload.level);
    }

    // PATCH بدل PUT
    const res = await axios.patch(`${API_URL}/${id}`, payload);
    return res.data;
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || error.message || 'Failed to update puzzle';
    return rejectWithValue(errorMsg);
  }
});


// 5. Delete puzzle
export const deletePuzzle = createAsyncThunk<number, number>(
  'puzzles/delete',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/${id}`)
      return id
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to delete puzzle';
      return rejectWithValue(errorMsg);
    }
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
        state.error = ((action.payload as string) || action.error.message) ?? 'Failed to fetch puzzles'
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
        state.error = ((action.payload as string) || action.error.message) ?? 'Failed to fetch puzzle'
      })
      // -----------------------------------------------------------

      .addCase(createPuzzle.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createPuzzle.fulfilled, (state, action: PayloadAction<Puzzle>) => {
        state.status = 'succeeded';
        state.puzzles.push(action.payload);
      })
      .addCase(createPuzzle.rejected, (state, action) => {
        state.status = 'failed';
        state.error = ((action.payload as string) || action.error.message) ?? 'Failed to create puzzle';
      })

      .addCase(updatePuzzle.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updatePuzzle.fulfilled, (state, action: PayloadAction<Puzzle>) => {
        state.status = 'succeeded';
        const index = state.puzzles.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.puzzles[index] = action.payload;
        }
      })
      .addCase(updatePuzzle.rejected, (state, action) => {
        state.status = 'failed';
        state.error = ((action.payload as string) || action.error.message) ?? 'Failed to update puzzle';
      })

      .addCase(deletePuzzle.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deletePuzzle.fulfilled, (state, action: PayloadAction<number>) => {
        state.status = 'succeeded';
        state.puzzles = state.puzzles.filter(p => p.id !== action.payload);
      })
      .addCase(deletePuzzle.rejected, (state, action) => {
        state.status = 'failed';
        state.error = ((action.payload as string) || action.error.message) ?? 'Failed to delete puzzle';
      });
  },
})

export default puzzleSlice.reducer

import { createSlice, createAsyncThunk,  } from '@reduxjs/toolkit'
import * as challengesApi from '@/api/challenges'

// هنضيف إنترفيس للـ Response اللي جاي من الـ Submit
export interface SubmitResponse {
  success: boolean
  awarded: boolean
  alreadySolved?: boolean
  points: number
  message: string
}

export interface Challenge {
  _id: string
  id?: string
  title: string
  description?: string
  code?: string
  initialCode?: string
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
  submitStatus: 'idle' | 'loading' | 'succeeded' | 'failed' // حالة خاصة بالتسليم
  error: string | null
}

const initialState: ChallengeState = {
  challenges: [],
  challenge: null,
  status: 'idle',
  submitStatus: 'idle',
  error: null
}

// 1. الأكشن بتاع جلب التحديات
export const fetchChallenges = createAsyncThunk<Challenge[]>(
  'challenges/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await challengesApi.fetchChallenges();
      // تأكد من الـ API بيبعت { success: true, data: [...] }
      return (response as any).data || response;
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to fetch challenges';
      return rejectWithValue(errorMsg);
    }
  }
)

// 2. الأكشن بتاع جلب تحدي واحد
export const fetchChallengeById = createAsyncThunk<Challenge, string>(
  'challenges/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await challengesApi.fetchChallengeById(id);
      return (response as any).data || response;
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to fetch challenge';
      return rejectWithValue(errorMsg);
    }
  }
)

// 3. الأكشن السحري الجديد: تسليم التحدي واحتساب النقط
export const submitChallenge = createAsyncThunk<SubmitResponse, { challengeId: string; answer: string }>(
  'challenges/submit',
  async ({ challengeId, answer }, { rejectWithValue }) => {
    try {
      // بنبعت الـ ID والحل في الـ API
      return await challengesApi.submitChallenge(challengeId, answer)
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to submit challenge';
      return rejectWithValue(errorMsg);
    }
  }
)

// 4. الأكشن بتاع إنشاء تحدي جديد
export const createChallenge = createAsyncThunk<Challenge, any>(
  'challenges/create',
  async (challengeData, { rejectWithValue }) => {
    try {
      const response = await challengesApi.createChallenge(challengeData);
      return (response as any).data || response;
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to create challenge';
      return rejectWithValue(errorMsg);
    }
  }
)

// 5. الأكشن بتاع تحديث تحدي موجود
export const updateChallenge = createAsyncThunk<Challenge, { id: string; challengeData: any }>(
  'challenges/update',
  async ({ id, challengeData }, { rejectWithValue }) => {
    try {
      const response = await challengesApi.updateChallenge(id, challengeData);
      return (response as any).data || response;
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to update challenge';
      return rejectWithValue(errorMsg);
    }
  }
)

// 6. الأكشن بتاع حذف تحدي
export const deleteChallenge = createAsyncThunk<string, string>(
  'challenges/delete',
  async (id, { rejectWithValue }) => {
    try {
      await challengesApi.deleteChallenge(id);
      return id;
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to delete challenge';
      return rejectWithValue(errorMsg);
    }
  }
)

const slice = createSlice({
  name: 'challenges',
  initialState,
  reducers: {
    // ممكن تضيف reducer هنا عشان تصفر الـ submitStatus لو اليوزر قفل الـ modal
    resetSubmitStatus: (state) => {
      state.submitStatus = 'idle';
    }
  },
  extraReducers: (builder) => {
    builder
      // جلب الكل
      .addCase(fetchChallenges.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchChallenges.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.challenges = action.payload
      })
      .addCase(fetchChallenges.rejected, (state, action) => {
        state.status = 'failed'
        state.error = ((action.payload as string) || action.error.message) ?? 'Failed to fetch challenges'
      })

      // جلب واحد
      .addCase(fetchChallengeById.pending, (state) => {
        state.status = 'loading'
        state.challenge = null
      })
      .addCase(fetchChallengeById.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.challenge = action.payload
      })
      .addCase(fetchChallengeById.rejected, (state, action) => {
        state.status = 'failed'
        state.error = ((action.payload as string) || action.error.message) ?? 'Failed to fetch challenge'
      })

      // تسيلم التحدي (Submit)
      .addCase(submitChallenge.pending, (state) => {
        state.submitStatus = 'loading'
      })
      .addCase(submitChallenge.fulfilled, (state, action) => {
        state.submitStatus = 'succeeded'
        // هنا ممكن تطلع Alert لليوزر وتقوله "مبروك أخدت X نقط"
        console.log('Submit Result:', action.payload)
      })
      .addCase(submitChallenge.rejected, (state, action) => {
        state.submitStatus = 'failed'
        state.error = ((action.payload as string) || action.error.message) ?? 'Failed to submit challenge'
      })

      // إنشاء تحدي جديد
      .addCase(createChallenge.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(createChallenge.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.challenges.push(action.payload)
      })
      .addCase(createChallenge.rejected, (state, action) => {
        state.status = 'failed'
        state.error = ((action.payload as string) || action.error.message) ?? 'Failed to create challenge'
      })

      // تحديث تحدي
      .addCase(updateChallenge.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(updateChallenge.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const index = state.challenges.findIndex(c => c.id === action.payload.id || c._id === action.payload._id)
        if (index !== -1) {
          state.challenges[index] = action.payload
        }
      })
      .addCase(updateChallenge.rejected, (state, action) => {
        state.status = 'failed'
        state.error = ((action.payload as string) || action.error.message) ?? 'Failed to update challenge'
      })

      // حذف تحدي
      .addCase(deleteChallenge.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(deleteChallenge.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.challenges = state.challenges.filter(c => (c.id || c._id) !== action.payload)
      })
      .addCase(deleteChallenge.rejected, (state, action) => {
        state.status = 'failed'
        state.error = ((action.payload as string) || action.error.message) ?? 'Failed to delete challenge'
      })
  }
})

export const { resetSubmitStatus } = slice.actions
export default slice.reducer
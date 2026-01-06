import { createSlice, createAsyncThunk,  } from '@reduxjs/toolkit'
import * as challengesApi from '@/api/challenges'

// هنضيف إنترفيس للـ Response اللي جاي من الـ Submit
interface SubmitResponse {
  success: boolean
  awarded: boolean
  points: number
  message: string
}

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
  async () => {
    const response = await challengesApi.fetchChallenges();
    // تأكد من الـ API بيبعت { success: true, data: [...] }
    return (response as any).data || response;
  }
)

// 2. الأكشن بتاع جلب تحدي واحد
export const fetchChallengeById = createAsyncThunk<Challenge, string>(
  'challenges/fetchById',
  async (id) => {
    const response = await challengesApi.fetchChallengeById(id);
    return (response as any).data || response;
  }
)

// 3. الأكشن السحري الجديد: تسليم التحدي واحتساب النقط
export const submitChallenge = createAsyncThunk<SubmitResponse, { challengeId: string; answer: string }>(
  'challenges/submit',
  async ({ challengeId, answer }) => {
    // بنبعت الـ ID والحل في الـ API
    return await challengesApi.submitChallenge(challengeId, answer)
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
        state.error = action.error.message ?? null
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
        state.error = action.error.message ?? null
      })
  }
})

export const { resetSubmitStatus } = slice.actions
export default slice.reducer
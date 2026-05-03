import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axiosInstance from '@/api/axios'

export interface AvailableLevel {
  level: number
  name: string
  description: string
  category: string
  difficulty: string
}

export interface CTFChallenge {
  level: number
  title: string
  description: string
  hints?: string[]
  hint?: string
  flag?: string
  difficulty: string
  commands?: any[]
  templateCommands?: any[]
  customCommands?: any[]
  requiredCommandSequence?: string[]
  successCondition?: string
  initialDirectory?: string
  hasCustomCommands?: boolean
}

export interface CTFLevelAdmin {
  id: number
  level: number
  title: string
  description: string
  hints: string[]
  flag: string
  difficulty: 'easy' | 'medium' | 'hard'
  isActive: boolean
  commands: any[]
  customCommands?: any[]
  requiredCommandSequence?: string[]
  successCondition?: string
  initialDirectory?: string
  createdAt: string
  updatedAt: string
}

export interface CTFTemplate {
  id?: number
  templateId: string
  name: string
  baseCommand: string
  defaultOutput?: string
  fields: string[]
  allowedPaths?: string[]
  blockedPaths?: string[]
  description?: string
  commands?: any[]
  version?: number
}

export interface CTFCommandExecutionResult {
  success: boolean
  output: string
  isNavigation?: boolean
  newPath?: string
}

interface CTFState {
  availableLevels: AvailableLevel[]
  availableLevelsStatus: 'idle' | 'loading' | 'succeeded' | 'failed'
  selectedChallenge: CTFChallenge | null
  challengeStatus: 'idle' | 'loading' | 'succeeded' | 'failed'
  adminLevels: CTFLevelAdmin[]
  adminLevelsStatus: 'idle' | 'loading' | 'succeeded' | 'failed'
  templates: CTFTemplate[]
  templatesStatus: 'idle' | 'loading' | 'succeeded' | 'failed'
  commandResult: CTFCommandExecutionResult | null
  commandStatus: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}

const initialState: CTFState = {
  availableLevels: [],
  availableLevelsStatus: 'idle',
  selectedChallenge: null,
  challengeStatus: 'idle',
  adminLevels: [],
  adminLevelsStatus: 'idle',
  templates: [],
  templatesStatus: 'idle',
  commandResult: null,
  commandStatus: 'idle',
  error: null,
}

export const fetchAvailableLevels = createAsyncThunk<AvailableLevel[]>(
  'ctf/fetchAvailableLevels',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('ctf/levels/available')
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch available levels')
    }
  }
)

export const fetchCTFChallenge = createAsyncThunk<CTFChallenge, number>(
  'ctf/fetchCTFChallenge',
  async (level, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`ctf/challenge/${level}`)
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch challenge')
    }
  }
)

export const fetchAllCTFLevels = createAsyncThunk<CTFLevelAdmin[]>(
  'ctf/fetchAllCTFLevels',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('ctf/admin/levels')
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch CTF levels')
    }
  }
)

export const fetchTemplates = createAsyncThunk<CTFTemplate[]>(
  'ctf/fetchTemplates',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('ctf/templates')
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch templates')
    }
  }
)

export const createCTFLevel = createAsyncThunk<CTFLevelAdmin, any>(
  'ctf/createCTFLevel',
  async (levelData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('ctf/admin/levels', levelData)
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to create CTF level')
    }
  }
)

export const updateCTFLevel = createAsyncThunk<CTFLevelAdmin, { id: number; levelData: any }>(
  'ctf/updateCTFLevel',
  async ({ id, levelData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`ctf/admin/levels/${id}`, levelData)
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to update CTF level')
    }
  }
)

export const deleteCTFLevel = createAsyncThunk<number, number>(
  'ctf/deleteCTFLevel',
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`ctf/admin/levels/${id}`)
      return id
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to delete CTF level')
    }
  }
)

export const toggleCTFLevelStatus = createAsyncThunk<CTFLevelAdmin, number>(
  'ctf/toggleCTFLevelStatus',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`ctf/admin/levels/${id}/toggle`)
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to toggle CTF level status')
    }
  }
)

export const createTemplate = createAsyncThunk<CTFTemplate, any>(
  'ctf/createTemplate',
  async (templateData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('ctf/templates', templateData)
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to create template')
    }
  }
)

export const updateTemplate = createAsyncThunk<CTFTemplate, { id: number; templateData: any }>(
  'ctf/updateTemplate',
  async ({ id, templateData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`ctf/templates/${id}`, templateData)
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to update template')
    }
  }
)

export const deleteTemplate = createAsyncThunk<number, number>(
  'ctf/deleteTemplate',
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`ctf/templates/${id}`)
      return id
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to delete template')
    }
  }
)

export const executeCTFCommand = createAsyncThunk<CTFCommandExecutionResult, { level: number; command: string; currentPath: string; sessionState?: any }>(
  'ctf/executeCTFCommand',
  async ({ level, command, currentPath, sessionState }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('ctf/execute', {
        level,
        command,
        currentPath,
        sessionState: sessionState || {},
      })
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to execute command')
    }
  }
)

const slice = createSlice({
  name: 'ctf',
  initialState,
  reducers: {
    clearSelectedChallenge: (state) => {
      state.selectedChallenge = null
      state.challengeStatus = 'idle'
      state.error = null
    },
    clearCommandResult: (state) => {
      state.commandResult = null
      state.commandStatus = 'idle'
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAvailableLevels.pending, (state) => {
        state.availableLevelsStatus = 'loading'
        state.error = null
      })
      .addCase(fetchAvailableLevels.fulfilled, (state, action) => {
        state.availableLevelsStatus = 'succeeded'
        state.availableLevels = action.payload
      })
      .addCase(fetchAvailableLevels.rejected, (state, action) => {
        state.availableLevelsStatus = 'failed'
        state.error = (action.payload as string) || action.error.message || 'Failed to fetch available levels'
      })

      .addCase(fetchCTFChallenge.pending, (state) => {
        state.challengeStatus = 'loading'
        state.error = null
      })
      .addCase(fetchCTFChallenge.fulfilled, (state, action) => {
        state.challengeStatus = 'succeeded'
        state.selectedChallenge = action.payload
      })
      .addCase(fetchCTFChallenge.rejected, (state, action) => {
        state.challengeStatus = 'failed'
        state.error = (action.payload as string) || action.error.message || 'Failed to fetch challenge'
      })

      .addCase(fetchAllCTFLevels.pending, (state) => {
        state.adminLevelsStatus = 'loading'
        state.error = null
      })
      .addCase(fetchAllCTFLevels.fulfilled, (state, action) => {
        state.adminLevelsStatus = 'succeeded'
        state.adminLevels = action.payload
      })
      .addCase(fetchAllCTFLevels.rejected, (state, action) => {
        state.adminLevelsStatus = 'failed'
        state.error = (action.payload as string) || action.error.message || 'Failed to fetch admin levels'
      })

      .addCase(fetchTemplates.pending, (state) => {
        state.templatesStatus = 'loading'
        state.error = null
      })
      .addCase(fetchTemplates.fulfilled, (state, action) => {
        state.templatesStatus = 'succeeded'
        state.templates = action.payload
      })
      .addCase(fetchTemplates.rejected, (state, action) => {
        state.templatesStatus = 'failed'
        state.error = (action.payload as string) || action.error.message || 'Failed to fetch templates'
      })

      .addCase(createCTFLevel.fulfilled, (state, action) => {
        state.adminLevels.push(action.payload)
      })
      .addCase(updateCTFLevel.fulfilled, (state, action) => {
        const index = state.adminLevels.findIndex((item) => item.id === action.payload.id)
        if (index !== -1) {
          state.adminLevels[index] = action.payload
        }
      })
      .addCase(deleteCTFLevel.fulfilled, (state, action) => {
        state.adminLevels = state.adminLevels.filter((item) => item.id !== action.payload)
      })
      .addCase(toggleCTFLevelStatus.fulfilled, (state, action) => {
        const index = state.adminLevels.findIndex((item) => item.id === action.payload.id)
        if (index !== -1) {
          state.adminLevels[index] = action.payload
        }
      })
      .addCase(createTemplate.fulfilled, (state, action) => {
        state.templates.push(action.payload)
      })
      .addCase(updateTemplate.fulfilled, (state, action) => {
        const index = state.templates.findIndex((item) => item.id === action.payload.id)
        if (index !== -1) {
          state.templates[index] = action.payload
        }
      })
      .addCase(deleteTemplate.fulfilled, (state, action) => {
        state.templates = state.templates.filter((item) => item.id !== action.payload)
      })

      .addCase(executeCTFCommand.pending, (state) => {
        state.commandStatus = 'loading'
        state.error = null
      })
      .addCase(executeCTFCommand.fulfilled, (state, action) => {
        state.commandStatus = 'succeeded'
        state.commandResult = action.payload
      })
      .addCase(executeCTFCommand.rejected, (state, action) => {
        state.commandStatus = 'failed'
        state.commandResult = null
        state.error = (action.payload as string) || action.error.message || 'Failed to execute command'
      })
  },
})

export const { clearSelectedChallenge, clearCommandResult } = slice.actions
export default slice.reducer

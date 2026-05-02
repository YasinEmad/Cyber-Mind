import axiosInstance from '../api/axios';
import type { Challenge } from './ctfLevels';
import { challenges as localChallenges } from './ctfLevels';

const API_BASE_URL = 'ctf';

/**
 * Hybrid challenges object that merges backend API data with local fsMods functions
 * The backend API provides: description, hint, flag
 * The frontend provides: fsMods (filesystem modifications)
 */

let cachedChallenges: Record<number, Challenge> | null = null;

/**
 * Load challenges from backend API with fallback to local definitions
 * This fetches challenge metadata from the backend and merges it with local fsMods
 */
export async function loadChallengesFromBackend(): Promise<Record<number, Challenge>> {
  // Return cached challenges if already loaded
  if (cachedChallenges) {
    return cachedChallenges;
  }

  try {
    // Fetch all available levels from backend
    const levelsResponse = await axiosInstance.get(`${API_BASE_URL}/levels/available`)
    const availableLevels = levelsResponse.data.data;
    
    // Create challenges object by merging backend data with local fsMods
    const mergedChallenges: Record<number, Challenge> = {};
    
    for (const levelInfo of availableLevels) {
      const level = levelInfo.level;
      const localChallenge = localChallenges[level];
      
      // Fetch detailed challenge data from backend
      const backendResponse = await axiosInstance.get(`${API_BASE_URL}/challenge/${level}`)
      const backendChallenge = backendResponse.data.data;

      // Merge: use backend data but keep local fsMods
      mergedChallenges[level] = {
        description: backendChallenge?.description || localChallenge?.description || '',
        // Backwards-compatible: set 'hint' to first hint if hints array exists
        hint:
          (Array.isArray(backendChallenge?.hints) && backendChallenge.hints[0]) ||
          backendChallenge?.hint ||
          localChallenge?.hint ||
          '',
        hints: backendChallenge?.hints || (localChallenge?.hint ? [localChallenge.hint] : []),
        flag: backendChallenge?.flag || localChallenge?.flag || '',
        title: backendChallenge?.title || `Level ${level}`,
        difficulty: backendChallenge?.difficulty || 'easy',
        commands: backendChallenge?.commands || [],
        requiredCommandSequence: backendChallenge?.requiredCommandSequence,
        successCondition: backendChallenge?.successCondition,
        initialDirectory: backendChallenge?.initialDirectory || '/home/user',
        fsMods: localChallenge?.fsMods || (() => {}), // Use local fsMods function
      };
    }
    
    cachedChallenges = mergedChallenges;
    return mergedChallenges;
  } catch (error) {
    console.warn('Failed to load challenges from backend, falling back to local definitions:', error);
    // Fallback to local challenges if backend is unavailable
    cachedChallenges = localChallenges;
    return localChallenges;
  }
}

/**
 * Get challenges synchronously (uses cached data or local fallback)
 * WARNING: Only use after loadChallengesFromBackend() has been called
 * Otherwise returns local fallback
 */
export function getChallenges(): Record<number, Challenge> {
  return cachedChallenges || localChallenges;
}

/**
 * Clear the cache (useful for testing or refreshing data)
 */
export function clearChallengeCache(): void {
  cachedChallenges = null;
}

/**
 * Preload a specific challenge from backend
 */
export async function preloadChallenge(level: number): Promise<Challenge> {
  try {
    const backendResponse = await axiosInstance.get(`${API_BASE_URL}/challenge/${level}`)
    const backendChallenge = backendResponse.data.data;
    const localChallenge = localChallenges[level];
    
    const challenge: Challenge = {
      description: backendChallenge?.description || localChallenge?.description || '',
      hint:
        (Array.isArray(backendChallenge?.hints) && backendChallenge.hints[0]) ||
        backendChallenge?.hint ||
        localChallenge?.hint ||
        '',
      hints: backendChallenge?.hints || (localChallenge?.hint ? [localChallenge.hint] : []),
      flag: backendChallenge?.flag || localChallenge?.flag || '',
      title: backendChallenge?.title || `Level ${level}`,
      difficulty: backendChallenge?.difficulty || 'easy',
      commands: backendChallenge?.commands || [],
      requiredCommandSequence: backendChallenge?.requiredCommandSequence,
      successCondition: backendChallenge?.successCondition,
      initialDirectory: backendChallenge?.initialDirectory || '/home/user',
      fsMods: localChallenge?.fsMods || (() => {}),
    };
    
    // Update cache
    if (cachedChallenges) {
      cachedChallenges[level] = challenge;
    }
    
    return challenge;
  } catch (error) {
    console.warn(`Failed to load challenge ${level} from backend, using local fallback:`, error);
    return localChallenges[level] || {
      description: '',
      hint: '',
      flag: '',
      title: `Level ${level}`,
      difficulty: 'easy',
      commands: [],
      requiredCommandSequence: null,
      successCondition: null,
      initialDirectory: '/home/user',
      fsMods: () => {},
    };
  }
}

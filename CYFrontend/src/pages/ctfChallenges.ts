import axiosInstance from '../api/axios';
import type { Challenge } from './ctfLevels';
import { challenges as localChallenges } from './ctfLevels';

const API_BASE_URL = 'ctf';
const CACHE_TTL_MS = 5 * 60 * 1000;

interface ChallengeCache {
  data: Record<number, Challenge>;
  timestamp: number;
  userId: string;
}

let challengeCache: ChallengeCache | null = null;
let inFlightRequest: Promise<Record<number, Challenge>> | null = null;

function mergeChallenge(id: number, backendChallenge: any, localChallenge: any): Challenge {
  return {
    description: backendChallenge?.description || localChallenge?.description || '',
    hint:
      (Array.isArray(backendChallenge?.hints) && backendChallenge.hints[0]) ||
      backendChallenge?.hint ||
      localChallenge?.hint ||
      '',
    hints: backendChallenge?.hints || (localChallenge?.hint ? [localChallenge.hint] : []),
    flag: backendChallenge?.flag || localChallenge?.flag || '',
    title: backendChallenge?.title || `Level`,
    difficulty: backendChallenge?.difficulty || 'easy',
    commands: backendChallenge?.commands || [],
    requiredCommandSequence: backendChallenge?.requiredCommandSequence,
    successCondition: backendChallenge?.successCondition,
    initialDirectory: backendChallenge?.initialDirectory || '/home/user',
    fsMods: localChallenge?.fsMods || (() => {}),
  };
}

async function fetchAllChallenges(availableLevels: { id: number }[]): Promise<Record<number, Challenge>> {
  const requests = availableLevels.map((levelInfo) =>
    axiosInstance
      .get(`${API_BASE_URL}/challenge/${levelInfo.id}`)
      .then((res) => ({ id: levelInfo.id, data: res.data.data }))
      .catch((err) => {
        console.error(`Failed to fetch challenge ${levelInfo.id}:`, err);
        return null;
      })
  );

  const results = await Promise.all(requests);
  const merged: Record<number, Challenge> = {};

  for (const result of results) {
    if (result) {
      merged[result.id] = mergeChallenge(result.id, result.data, localChallenges[result.id]);
    }
  }

  return merged;
}

function isValidCache(userId: string): boolean {
  if (!challengeCache) return false;
  if (challengeCache.userId !== userId) return false;
  if (Date.now() - challengeCache.timestamp > CACHE_TTL_MS) return false;
  return true;
}

/**
 * Load challenges from backend API with fallback to local definitions.
 * Uses parallel requests, TTL-based caching, and in-flight deduplication.
 */
export async function loadChallengesFromBackend(userId?: string): Promise<Record<number, Challenge>> {
  const uid = userId || 'anonymous';

  if (isValidCache(uid)) {
    return challengeCache!.data;
  }

  if (inFlightRequest) {
    return inFlightRequest;
  }

  inFlightRequest = (async () => {
    try {
      const levelsResponse = await axiosInstance.get(`${API_BASE_URL}/levels/available`);
      const availableLevels = levelsResponse.data.data;

      const mergedChallenges = await fetchAllChallenges(availableLevels);

      challengeCache = {
        data: mergedChallenges,
        timestamp: Date.now(),
        userId: uid,
      };

      return mergedChallenges;
    } catch (error) {
      console.warn('Failed to load challenges from backend, falling back to local definitions:', error);
      challengeCache = {
        data: localChallenges,
        timestamp: Date.now(),
        userId: uid,
      };
      return localChallenges;
    } finally {
      inFlightRequest = null;
    }
  })();

  return inFlightRequest;
}

/**
 * Get challenges synchronously (uses cached data or local fallback)
 * WARNING: Only use after loadChallengesFromBackend() has been called
 * Otherwise returns local fallback
 */
export function getChallenges(): Record<number, Challenge> {
  return challengeCache?.data || localChallenges;
}

/**
 * Clear the cache (useful for testing or refreshing data)
 */
export function clearChallengeCache(): void {
  challengeCache = null;
  inFlightRequest = null;
}

/**
 * Preload a specific challenge from backend
 */
export async function preloadChallenge(id: number): Promise<Challenge> {
  try {
    const backendResponse = await axiosInstance.get(`${API_BASE_URL}/challenge/${id}`);
    const backendChallenge = backendResponse.data.data;
    const localChallenge = localChallenges[id];
    const challenge = mergeChallenge(id, backendChallenge, localChallenge);

    if (challengeCache) {
      challengeCache.data[id] = challenge;
    }

    return challenge;
  } catch (error) {
    console.warn(`Failed to load challenge ${id} from backend, using local fallback:`, error);
    return localChallenges[id] || {
      description: '',
      hint: '',
      flag: '',
      title: `Challenge`,
      difficulty: 'easy',
      commands: [],
      requiredCommandSequence: null,
      successCondition: null,
      initialDirectory: '/home/user',
      fsMods: () => {},
    };
  }
}

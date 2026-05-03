// Re-export everything from modular files

// From filesystem.ts
export type { FileSystemNode, FileSystem } from '../lib/filesystem';
export { USERNAME, HOSTNAME, VERSION, initialFS, resolvePath, getCTFFS } from '../lib/filesystem';

// From terminal.ts
export type { TerminalLine } from './terminal';
export { createTerminalEngine } from './terminal';

// From os.ts
export type { WindowState, OSState, OSAction, OSContextType } from '../lib/os';
export { OSContext, appDefaults, appMeta, osReducer } from '../lib/os';

// From ctfLevels.ts (local fallback)
export type { Challenge } from './ctfLevels';
export { challenges as localChallenges } from './ctfLevels';

// From ctfChallenges.ts (backend-integrated challenges)
// NOTE: Use getChallenges() after calling loadChallengesFromBackend() on app initialization
export { 
  loadChallengesFromBackend, 
  getChallenges, 
  clearChallengeCache, 
  preloadChallenge 
} from './ctfChallenges';

// Create a re-export of getChallenges as 'challenges' for backward compatibility
// This will be populated from the backend on app initialization
import { getChallenges } from './ctfChallenges';
export const challenges = getChallenges();
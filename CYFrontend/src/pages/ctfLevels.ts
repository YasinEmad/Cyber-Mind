import type { FileSystem } from '../lib/filesystem';

// NOTE: The authoritative CTF levels are now stored in the backend at CYBackend/src/data/ctfLevels.js
// This file is kept on the frontend for local execution of filesystem modifications (fsMods)
// and as a fallback if the backend is unavailable. It should be kept in sync with the backend.

export interface Challenge {
  description: string;
  hint: string;
  hints?: string[];
  flag: string;
  title?: string;
  difficulty?: string;
  commands?: Array<{
    name: string;
    output: string;
    description: string;
    allowedPaths?: string[];
    blockedPaths?: string[];
  }>;
  requiredCommandSequence?: string[];
  successCondition?: string;
  initialDirectory?: string;
  fsMods: (fs: FileSystem) => void;
}

// ─── CTF CHALLENGES ──────────────────────────────────────────────────────────
export const challenges: Record<number, Challenge> = {
  1: {
    description: 'Find the hidden file in the Desktop folder that contains the flag.',
    hint: 'Use ls -a to reveal hidden files.',
    flag: 'CTF{navigation_master}',
    fsMods: (fs: FileSystem) => {
      const hiddenPath = '/home/user/Desktop/.hidden_flag.txt';
      fs[hiddenPath] = { type: 'file', content: 'CTF{navigation_master}' };

      const desktop = fs['/home/user/Desktop'];

      if (
        desktop &&
        desktop.type === 'dir' &&
        desktop.children &&
        !desktop.children.includes('.hidden_flag.txt')
      ) {
        desktop.children = [...desktop.children, '.hidden_flag.txt'];
      }
    },
  },
  2: {
    description: 'Find a file with restricted permissions containing the flag.',
    hint: 'Check file permissions with ls -l and look for readable content.',
    flag: 'CTF{permission_explorer}',
    fsMods: (fs: FileSystem) => {
      const restrictedPath = '/home/user/Documents/.restricted.txt';
      fs[restrictedPath] = {
        type: 'file',
        content: 'CTF{permission_explorer}',
      };

      const documents = fs['/home/user/Documents'];
      if (
        documents &&
        documents.type === 'dir' &&
        documents.children &&
        !documents.children.includes('.restricted.txt')
      ) {
        documents.children = [...documents.children, '.restricted.txt'];
      }
    },
  },
  3: {
    description: 'Extract the secret flag from environment variables.',
    hint: 'Use env or printenv commands to see all environment variables.',
    flag: 'CTF{env_secrets}',
    fsMods: (fs: FileSystem) => {
      // Environment variables are handled separately in terminal
    },
  },
};

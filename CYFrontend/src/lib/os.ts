import React from 'react';
import { FileSystem } from './filesystem';

// ─── TYPES & INTERFACES ──────────────────────────────────────────────────────
export interface WindowState {
  id: number;
  appId: string;
  title: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minimized: boolean;
  zIndex: number;
  entering?: boolean;
}

export interface OSState {
  windows: WindowState[];
  zCounter: number;
  activeWindow: number | null;
  notification?: string;
}

export interface OSAction {
  type: 'OPEN_WINDOW' | 'CLOSE_WINDOW' | 'MINIMIZE_WINDOW' | 'FOCUS_WINDOW' | 'MOVE_WINDOW' | 'RESIZE_WINDOW' | 'CLEAR_ENTERING' | 'SET_NOTIFICATION';
  id?: number;
  appId?: string;
  title?: string;
  forceNew?: boolean;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  notification?: string;
}

export interface OSContextType {
  fs: FileSystem;
  setFs: React.Dispatch<React.SetStateAction<FileSystem>>;
  isCTFMode: boolean;
  currentLevel: number;
  setCtfNotification: React.Dispatch<React.SetStateAction<string | null>>;
  challenges?: Record<number, any>;
}

export const OSContext = React.createContext<OSContextType | null>(null);

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
export const appDefaults: { [key: string]: { w: number; h: number } } = {
  terminal: { w: 800, h: 500 },
  files: { w: 900, h: 550 },
  settings: { w: 850, h: 580 },
  about: { w: 600, h: 450 },
  browser: { w: 1000, h: 650 },
};

export const appMeta: { [key: string]: { title: string; icon: string; color: string } } = {
  terminal: { title: 'Terminal', icon: '⬛', color: '#2d2d2d' },
  files: { title: 'Files', icon: '📁', color: '#e95420' },
  settings: { title: 'Settings', icon: '⚙️', color: '#4a4a4a' },
  about: { title: 'About This System', icon: 'ℹ️', color: '#1d6996' },
  browser: { title: 'Browser', icon: '🌐', color: '#1565c0' },
};

// ─── OS REDUCER ───────────────────────────────────────────────────────────────
export function osReducer(state: OSState, action: OSAction): OSState {
  switch (action.type) {
    case 'OPEN_WINDOW': {
      if (!action.appId) return state;
      const existing = state.windows.find(
        (w) => w.appId === action.appId && !action.forceNew
      );
      if (existing) {
        return {
          ...state,
          windows: state.windows.map((w) =>
            w.id === existing.id
              ? { ...w, minimized: false, zIndex: state.zCounter + 1 }
              : w
          ),
          zCounter: state.zCounter + 1,
          activeWindow: existing.id,
        };
      }
      const id = Date.now() + Math.random();
      const defaults = appDefaults[action.appId] || { w: 800, h: 500 };
      const offset = state.windows.length * 30;
      const newWin: WindowState = {
        id,
        appId: action.appId,
        title: action.title || '',
        x: 100 + offset,
        y: 60 + offset,
        w: defaults.w,
        h: defaults.h,
        minimized: false,
        zIndex: state.zCounter + 1,
        entering: true,
      };
      return {
        ...state,
        windows: [...state.windows, newWin],
        zCounter: state.zCounter + 1,
        activeWindow: id,
      };
    }
    case 'CLOSE_WINDOW':
      if (!action.id) return state;
      return {
        ...state,
        windows: state.windows.filter((w) => w.id !== action.id),
        activeWindow:
          state.windows.filter((w) => w.id !== action.id).slice(-1)[0]?.id || null,
      };
    case 'MINIMIZE_WINDOW':
      if (!action.id) return state;
      return {
        ...state,
        windows: state.windows.map((w) =>
          w.id === action.id ? { ...w, minimized: true } : w
        ),
        activeWindow: null,
      };
    case 'FOCUS_WINDOW':
      if (!action.id) return state;
      return {
        ...state,
        windows: state.windows.map((w) =>
          w.id === action.id
            ? { ...w, zIndex: state.zCounter + 1, minimized: false }
            : w
        ),
        zCounter: state.zCounter + 1,
        activeWindow: action.id,
      };
    case 'MOVE_WINDOW':
      if (!action.id) return state;
      return {
        ...state,
        windows: state.windows.map((w) =>
          w.id === action.id
            ? { ...w, x: action.x || 0, y: action.y || 0 }
            : w
        ),
      };
    case 'RESIZE_WINDOW':
      if (!action.id) return state;
      return {
        ...state,
        windows: state.windows.map((w) =>
          w.id === action.id
            ? {
                ...w,
                w: Math.max(400, action.w || 400),
                h: Math.max(300, action.h || 300),
              }
            : w
        ),
      };
    case 'CLEAR_ENTERING':
      if (!action.id) return state;
      return {
        ...state,
        windows: state.windows.map((w) =>
          w.id === action.id ? { ...w, entering: false } : w
        ),
      };
    case 'SET_NOTIFICATION':
      return { ...state, notification: action.notification };
    default:
      return state;
  }
}
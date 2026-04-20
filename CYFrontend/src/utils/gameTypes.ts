// ── Types ─────────────────────────────────────────────────────────────────────
export interface PortData {
  id: number;
  x: number;
  y: number;
}

export interface PiratePos {
  x: number;
  y: number;
}

export interface TrailDot {
  x: number;
  y: number;
  id: number;
}

export interface GameState {
  current: number;
  completed: number[];
}

// ── Port layout ───────────────────────────────────────────────────────────────
export const PORTS: PortData[] = [
  { id: 1,  x: 9,   y: 80 },
  { id: 2,  x: 15,  y: 70 },
  { id: 3,  x: 11,  y: 59 },
  { id: 4,  x: 19,  y: 49 },
  { id: 5,  x: 13,  y: 38 },
  { id: 6,  x: 23,  y: 28 },
  { id: 7,  x: 33,  y: 22 },
  { id: 8,  x: 43,  y: 17 },
  { id: 9,  x: 53,  y: 13 },
  { id: 10, x: 63,  y: 19 },
  { id: 11, x: 71,  y: 27 },
  { id: 12, x: 79,  y: 21 },
  { id: 13, x: 87,  y: 13 },
  { id: 14, x: 91,  y: 23 },
  { id: 15, x: 85,  y: 33 },
  { id: 16, x: 89,  y: 43 },
  { id: 17, x: 83,  y: 53 },
  { id: 18, x: 89,  y: 63 },
  { id: 19, x: 83,  y: 73 },
  { id: 20, x: 75,  y: 80 },
  { id: 21, x: 65,  y: 76 },
  { id: 22, x: 57,  y: 83 },
  { id: 23, x: 47,  y: 79 },
  { id: 24, x: 39,  y: 85 },
  { id: 25, x: 31,  y: 78 },
  { id: 26, x: 37,  y: 67 },
  { id: 27, x: 29,  y: 59 },
  { id: 28, x: 37,  y: 51 },
  { id: 29, x: 47,  y: 55 },
  { id: 30, x: 57,  y: 51 },
  { id: 31, x: 65,  y: 57 },
  { id: 32, x: 73,  y: 49 },
  { id: 33, x: 67,  y: 39 },
  { id: 34, x: 55,  y: 35 },
  { id: 35, x: 45,  y: 41 },
];

export const STORAGE_KEY = "pirate_island_v2";

export function loadProgress(): GameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { current: 1, completed: [] };
  } catch { return { current: 1, completed: [] }; }
}

export function saveProgress(state: GameState) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
}

export function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

export const levelToPoints: Record<number, number> = {
  1: 10,
  2: 15,
  3: 20,
};

const DEFAULT_POINTS = 10;

export function getPointsForLevel(level?: number | string): number {
  try { console.log('frontend.getPointsForLevel: input:', level, 'typeof:', typeof level); } catch (e) {}

  // Handle undefined/null early
  if (level === null || typeof level === 'undefined') {
    try { console.log('frontend.getPointsForLevel: returning default:', DEFAULT_POINTS); } catch (e) {}
    return DEFAULT_POINTS;
  }

  // Coerce strings like "2" (or numeric types) to a number and validate
  const n = Number(level);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n <= 0) {
    try { console.debug('frontend.getPointsForLevel: invalid parsed level, returning default'); } catch (e) {}
    return DEFAULT_POINTS;
  }

  const result = levelToPoints[n] ?? DEFAULT_POINTS;
  try { console.log('frontend.getPointsForLevel: parsed:', n, 'result:', result); } catch (e) {}
  return result;
} 

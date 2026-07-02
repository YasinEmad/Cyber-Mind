// Points are now calculated on the backend based on difficulty.
// This function is kept for backward compatibility but always returns 0
// since level numbers no longer exist.
export function getPointsForLevel(_level?: number | string): number {
  return 0;
} 

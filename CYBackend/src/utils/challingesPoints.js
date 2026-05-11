const difficultyToPoints = {
  easy: 10,
  medium: 20,
  hard: 30,
};

// بنعمل Export بنفس الاسم اللي الكنترولر مستنيه (CHALLENGE_POINTS)
const CHALLENGE_POINTS = difficultyToPoints;

const DEFAULT_POINTS = 10;

const getPointsForDifficulty = (difficulty, opts = {}) => {
  if (typeof difficulty !== 'string') {
    return opts.strict ? null : DEFAULT_POINTS;
  }

  const key = difficulty.toLowerCase();
  const points = difficultyToPoints[key];

  if (opts.strict) return points ?? null;

  return points ?? DEFAULT_POINTS;
};

module.exports = {
  difficultyToPoints,
  CHALLENGE_POINTS, // ضيفنا دي هنا
  getPointsForDifficulty,
  DEFAULT_POINTS,
};
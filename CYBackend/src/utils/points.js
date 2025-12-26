const levelToPoints = {
  1: 10,
  2: 15,
  3: 20,
};

const DEFAULT_POINTS = 10;

const getPointsForLevel = (level, opts = {}) => {
  // تحويل المدخل لأي رقم
  const n = Number(level);

  // لو مش integer
  if (!Number.isInteger(n)) return opts.strict ? null : DEFAULT_POINTS;

  const points = levelToPoints[n];

  // strict = true => رجّع null لو المستوى غير موجود
  if (opts.strict) return points ?? null;

  // otherwise رجّع القيمة أو default
  return points ?? DEFAULT_POINTS;
};

module.exports = {
  levelToPoints,
  getPointsForLevel,
  DEFAULT_POINTS,
};

const { getPointsForLevel, levelToPoints } = require('../points');

describe('points util', () => {
  test('returns correct values for known levels', () => {
    expect(getPointsForLevel(1)).toBe(10);
    expect(getPointsForLevel(2)).toBe(15);
    expect(getPointsForLevel(3)).toBe(20);
  });

  test('falls back to default 10 for unknown or missing levels', () => {
    expect(getPointsForLevel(99)).toBe(10);
    expect(getPointsForLevel(undefined)).toBe(10);
  });

  test('accepts numeric-like strings and trims whitespace', () => {
    expect(getPointsForLevel('2')).toBe(15);
    expect(getPointsForLevel(' 2 ')).toBe(15);
    expect(getPointsForLevel('3')).toBe(20);
  });

  test('rejects invalid strings and decimals', () => {
    expect(getPointsForLevel('two')).toBe(10);
    expect(getPointsForLevel('2.5')).toBe(10);
  });

  test('strict mode returns null for unknown/invalid inputs', () => {
    expect(getPointsForLevel(99, { strict: true })).toBeNull();
    expect(getPointsForLevel('two', { strict: true })).toBeNull();
    expect(getPointsForLevel(undefined, { strict: true })).toBeNull();
  });

  test('levelToPoints contains expected keys', () => {
    expect(levelToPoints[1]).toBe(10);
    expect(levelToPoints[2]).toBe(15);
    expect(levelToPoints[3]).toBe(20);
  });
});

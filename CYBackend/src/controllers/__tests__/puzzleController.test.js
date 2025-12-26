const { submitAnswer } = require('../puzzleController');

// Mock the Puzzle model used by the controller
jest.mock('../../models/Puzzle', () => ({
  findById: jest.fn(),
}));
jest.mock('../../models/Profile', () => ({
  findById: jest.fn(),
}));
jest.mock('../../models/User', () => ({
  findById: jest.fn(),
}));

describe('submitAnswer controller', () => {
  const Puzzle = require('../../models/Puzzle');

  beforeEach(() => {
    jest.resetAllMocks();
  });

  function fakeRes() {
    const out = {};
    out.status = jest.fn().mockReturnValue(out);
    out.json = jest.fn().mockReturnValue(out);
    return out;
  }

  test('guest correct answer returns correct:true and no auth error', async () => {
    Puzzle.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({
        _id: 'p1',
        answer: 'secret',
        level: 1,
        tag: 'tag1',
      }),
    });

    const req = { params: { id: 'p1' }, body: { answer: 'secret' }, user: null };
    const res = fakeRes();

    await submitAnswer(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ correct: true }));
  });

  test('incorrect answer returns correct:false', async () => {
    Puzzle.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({
        _id: 'p1',
        answer: 'secret',
        level: 1,
        tag: 'tag1',
      }),
    });

    const req = { params: { id: 'p1' }, body: { answer: 'wrong' }, user: null };
    const res = fakeRes();

    await submitAnswer(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ correct: false }));
  });

  test('authenticated user first solve gets points and profile updated', async () => {
    Puzzle.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({
        _id: 'p1',
        answer: 'secret',
        level: 1,
        tag: 'tag1',
      }),
    });

    const Profile = require('../../models/Profile');
    const fakeProfile = { _id: 'pr1', totalScore: 0, puzzlesDone: 0, save: jest.fn().mockResolvedValue(true) };
    Profile.findById.mockResolvedValue(fakeProfile);

    const fakeUser = { _id: 'u1', solvedPuzzles: [], profile: 'pr1', save: jest.fn().mockResolvedValue(true) };
    const User = require('../../models/User');
    User.findById.mockImplementationOnce(() => ({ populate: jest.fn().mockResolvedValue({ ...fakeUser, profile: fakeProfile }) }));
    const req = { params: { id: 'p1' }, body: { answer: 'secret' }, user: fakeUser };
    const res = fakeRes();

    await submitAnswer(req, res);

    // response should be correct and alreadySolved=false and award 10 points
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ correct: true, alreadySolved: false, awardedPoints: true, awardedPointsAmount: 10 }));
    // user's solvedPuzzles should be updated
    // solvedPuzzles should now store the puzzle _id rather than the tag
    expect(fakeUser.solvedPuzzles).toContain('p1');
    // profile was retrieved and saved with updated counters
    expect(Profile.findById).toHaveBeenCalledWith('pr1');
    expect(fakeProfile.totalScore).toBe(10);
    expect(fakeProfile.puzzlesDone).toBe(1);
  });

  test('authenticated user first solve of level 2 awards 15 points', async () => {
    Puzzle.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({
        _id: 'p2',
        answer: 'secret',
        level: 2,
        tag: 'tag2',
      }),
    });

    const Profile = require('../../models/Profile');
    const fakeProfile = { _id: 'pr2', totalScore: 0, puzzlesDone: 0, save: jest.fn().mockResolvedValue(true) };
    Profile.findById.mockResolvedValue(fakeProfile);

    const fakeUser = { _id: 'u2', solvedPuzzles: [], profile: 'pr2', save: jest.fn().mockResolvedValue(true) };
    const User = require('../../models/User');
    User.findById.mockImplementationOnce(() => ({ populate: jest.fn().mockResolvedValue({ ...fakeUser, profile: fakeProfile }) }));
    const req = { params: { id: 'p2' }, body: { answer: 'secret' }, user: fakeUser };
    const res = fakeRes();

    await submitAnswer(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ correct: true, alreadySolved: false, awardedPoints: true, awardedPointsAmount: 15 }));
    expect(fakeUser.solvedPuzzles).toContain('p2');
    expect(Profile.findById).toHaveBeenCalledWith('pr2');
    expect(fakeProfile.totalScore).toBe(15);
    expect(fakeProfile.puzzlesDone).toBe(1);
  });

  test('authenticated user first solve of level 3 awards 20 points', async () => {
    Puzzle.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({
        _id: 'p3',
        answer: 'secret',
        level: 3,
        tag: 'tag3',
      }),
    });

    const Profile = require('../../models/Profile');
    const fakeProfile = { _id: 'pr3', totalScore: 0, puzzlesDone: 0, save: jest.fn().mockResolvedValue(true) };
    Profile.findById.mockResolvedValue(fakeProfile);

    const fakeUser = { _id: 'u3', solvedPuzzles: [], profile: 'pr3', save: jest.fn().mockResolvedValue(true) };
    const User = require('../../models/User');
    User.findById.mockImplementationOnce(() => ({ populate: jest.fn().mockResolvedValue({ ...fakeUser, profile: fakeProfile }) }));
    const req = { params: { id: 'p3' }, body: { answer: 'secret' }, user: fakeUser };
    const res = fakeRes();

    await submitAnswer(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ correct: true, alreadySolved: false, awardedPoints: true, awardedPointsAmount: 20 }));
    expect(fakeUser.solvedPuzzles).toContain('p3');
    expect(Profile.findById).toHaveBeenCalledWith('pr3');
    expect(fakeProfile.totalScore).toBe(20);
    expect(fakeProfile.puzzlesDone).toBe(1);
  });

  test('authenticated user solving same puzzle again receives alreadySolved and no more points', async () => {
    Puzzle.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({
        _id: 'p1',
        answer: 'secret',
        tag: 'tag1',
      }),
    });

    const Profile = require('../../models/Profile');
    Profile.findById.mockClear();

    const fakeProfile = { _id: 'pr1', totalScore: 10, puzzlesDone: 1, save: jest.fn().mockResolvedValue(true) };
    Profile.findById.mockResolvedValue(fakeProfile);

    const fakeUser = { solvedPuzzles: ['p1'], profile: 'pr1', save: jest.fn().mockResolvedValue(true) };
    const req = { params: { id: 'p1' }, body: { answer: 'secret' }, user: fakeUser };
    const res = fakeRes();

    await submitAnswer(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ correct: true, alreadySolved: true, awardedPoints: false }));
    // no profile update should occur for repeated solve
    expect(Profile.findById).not.toHaveBeenCalled();
    expect(fakeProfile.totalScore).toBe(10);
    expect(fakeProfile.puzzlesDone).toBe(1);
  });

  test('missing level in DB defaults to level 1, awards points and includes warning', async () => {
    // Puzzle returned without level field
    Puzzle.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({
        _id: 'pN',
        answer: 'secret',
        tag: 'tagN'
      }),
    });

    const Profile = require('../../models/Profile');
    const fakeProfile = { _id: 'prN', totalScore: 0, puzzlesDone: 0, save: jest.fn().mockResolvedValue(true) };
    Profile.findById.mockResolvedValue(fakeProfile);

    const fakeUser = { _id: 'uN', solvedPuzzles: [], profile: 'prN', save: jest.fn().mockResolvedValue(true) };
    const User = require('../../models/User');
    User.findById.mockImplementationOnce(() => ({ populate: jest.fn().mockResolvedValue({ ...fakeUser, profile: fakeProfile }) }));

    const req = { params: { id: 'pN' }, body: { answer: 'secret' }, user: fakeUser };
    const res = fakeRes();

    await submitAnswer(req, res);

    // defaulted to 1 => 10 points awarded and warning attached
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ correct: true, alreadySolved: false, awardedPoints: true, awardedPointsAmount: 10, awardedPointsWarning: expect.any(String) }));
    expect(fakeProfile.totalScore).toBe(10);
    expect(fakeProfile.puzzlesDone).toBe(1);
  });

  test('unknown level mapping results in 0 points and warning in response', async () => {
    Puzzle.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({
        _id: 'pX',
        answer: 'secret',
        level: 99,
        tag: 'tagX',
      }),
    });

    const Profile = require('../../models/Profile');
    const fakeProfile = { _id: 'prX', totalScore: 0, puzzlesDone: 0, save: jest.fn().mockResolvedValue(true) };
    Profile.findById.mockResolvedValue(fakeProfile);

    const fakeUser = { _id: 'uX', solvedPuzzles: [], profile: 'prX', save: jest.fn().mockResolvedValue(true) };
    const User = require('../../models/User');
    User.findById.mockImplementationOnce(() => ({ populate: jest.fn().mockResolvedValue({ ...fakeUser, profile: fakeProfile }) }));
    const req = { params: { id: 'pX' }, body: { answer: 'secret' }, user: fakeUser };
    const res = fakeRes();

    await submitAnswer(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ correct: true, alreadySolved: false, awardedPoints: true, awardedPointsAmount: 0, awardedPointsInfo: expect.objectContaining({ puzzleLevel: 99, computedPoints: 0 }), awardedPointsWarning: expect.any(String) }));
    expect(fakeProfile.totalScore).toBe(0);
    expect(fakeProfile.puzzlesDone).toBe(1);
  });
});

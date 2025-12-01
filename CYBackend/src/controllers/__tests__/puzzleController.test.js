const { submitAnswer } = require('../puzzleController');

// Mock the Puzzle model used by the controller
jest.mock('../../models/Puzzle', () => ({
  findById: jest.fn(),
}));
jest.mock('../../models/Profile', () => ({
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
        tag: 'tag1',
      }),
    });

    const Profile = require('../../models/Profile');
    const fakeProfile = { _id: 'pr1', totalScore: 0, puzzlesDone: 0, save: jest.fn().mockResolvedValue(true) };
    Profile.findById.mockResolvedValue(fakeProfile);

    const fakeUser = { solvedPuzzles: [], profile: 'pr1', save: jest.fn().mockResolvedValue(true) };
    const req = { params: { id: 'p1' }, body: { answer: 'secret' }, user: fakeUser };
    const res = fakeRes();

    await submitAnswer(req, res);

    // response should be correct and alreadySolved=false
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ correct: true, alreadySolved: false, awardedPoints: true }));
    // user's solvedPuzzles should be updated
    // solvedPuzzles should now store the puzzle _id rather than the tag
    expect(fakeUser.solvedPuzzles).toContain('p1');
    // profile was retrieved and saved with updated counters
    expect(Profile.findById).toHaveBeenCalledWith('pr1');
    expect(fakeProfile.totalScore).toBe(10);
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
});

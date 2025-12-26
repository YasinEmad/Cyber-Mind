const { addPoints } = require('../userController');

jest.mock('../../models/User', () => ({
  findById: jest.fn(),
}));

jest.mock('../../models/Profile', () => ({
  findById: jest.fn(),
}));

describe('addPoints controller', () => {
  const User = require('../../models/User');
  const Profile = require('../../models/Profile');

  beforeEach(() => {
    jest.resetAllMocks();
  });

  function fakeRes() {
    const out = {};
    out.status = jest.fn().mockReturnValue(out);
    out.json = jest.fn().mockReturnValue(out);
    return out;
  }

  test('defaults to 10 points when no body provided', async () => {
    const fakeProfile = { _id: 'pr1', totalScore: 0, puzzlesDone: 0, save: jest.fn().mockResolvedValue(true) };

    const initialUser = { _id: 'u1', profile: { _id: 'pr1' } };
    // Simulate Mongoose query chaining: findById(...).populate('profile')
    User.findById.mockImplementationOnce(() => ({ populate: jest.fn().mockResolvedValue(initialUser) }));
    Profile.findById.mockResolvedValue(fakeProfile);
    // final updated user (returned by second findById) should include populated profile
    User.findById.mockImplementationOnce(() => ({ populate: jest.fn().mockResolvedValue({ ...initialUser, profile: fakeProfile }) }));

    const req = { user: { _id: 'u1' }, body: {} };
    const res = fakeRes();

    await addPoints(req, res, () => {});

    expect(fakeProfile.totalScore).toBe(10);
    expect(fakeProfile.puzzlesDone).toBe(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, awardedPointsAmount: 10 }));
  });

  test('level 2 awards 15 points', async () => {
    const fakeProfile = { _id: 'pr2', totalScore: 0, puzzlesDone: 0, save: jest.fn().mockResolvedValue(true) };

    const initialUser = { _id: 'u2', profile: { _id: 'pr2' } };
    User.findById.mockImplementationOnce(() => ({ populate: jest.fn().mockResolvedValue(initialUser) }));
    Profile.findById.mockResolvedValue(fakeProfile);
    User.findById.mockImplementationOnce(() => ({ populate: jest.fn().mockResolvedValue({ ...initialUser, profile: fakeProfile }) }));

    const req = { user: { _id: 'u2' }, body: { level: 2 } };
    const res = fakeRes();

    await addPoints(req, res, () => {});

    expect(fakeProfile.totalScore).toBe(15);
    expect(fakeProfile.puzzlesDone).toBe(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, awardedPointsAmount: 15 }));
  });

  test('level 3 awards 20 points', async () => {
    const fakeProfile = { _id: 'pr3', totalScore: 0, puzzlesDone: 0, save: jest.fn().mockResolvedValue(true) };

    const initialUser = { _id: 'u3', profile: { _id: 'pr3' } };
    User.findById.mockImplementationOnce(() => ({ populate: jest.fn().mockResolvedValue(initialUser) }));
    Profile.findById.mockResolvedValue(fakeProfile);
    User.findById.mockImplementationOnce(() => ({ populate: jest.fn().mockResolvedValue({ ...initialUser, profile: fakeProfile }) }));

    const req = { user: { _id: 'u3' }, body: { level: 3 } };
    const res = fakeRes();

    await addPoints(req, res, () => {});

    expect(fakeProfile.totalScore).toBe(20);
    expect(fakeProfile.puzzlesDone).toBe(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, awardedPointsAmount: 20 }));
  });
});

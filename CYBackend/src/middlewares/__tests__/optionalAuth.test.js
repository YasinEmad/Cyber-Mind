const { optionalAuth } = require('../optionalAuth');

let verifyIdTokenMock;
jest.mock('../../config/firebaseAdmin', () => ({
  auth: jest.fn(),
}));

const admin = require('../../config/firebaseAdmin');

jest.mock('../../models/User', () => ({
  findOne: jest.fn(),
}));

const User = require('../../models/User');

describe('optionalAuth middleware', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = { headers: {}, cookies: {} };
    res = {};
    next = jest.fn();
    // make sure admin.auth returns a consistent object with a mock
    verifyIdTokenMock = jest.fn();
    admin.auth.mockReturnValue({ verifyIdToken: verifyIdTokenMock });
    User.findOne.mockReset();
  });

  test('no token present -> req.user = null', async () => {
    await optionalAuth(req, res, next);
    expect(req.user).toBeNull();
    expect(next).toHaveBeenCalled();
  });

  test('invalid token -> req.user = null and continues', async () => {
    verifyIdTokenMock.mockRejectedValue(new Error('invalid'));
    req.headers.authorization = 'Bearer badtoken';

    await optionalAuth(req, res, next);

    expect(admin.auth().verifyIdToken).toHaveBeenCalledWith('badtoken');
    expect(req.user).toBeNull();
    expect(next).toHaveBeenCalled();
  });

  test('valid token -> user populated on req.user', async () => {
    verifyIdTokenMock.mockResolvedValue({ uid: 'u-1' });
    const fakeUser = { uid: 'u-1', name: 'Alice', profile: { totalScore: 0 } };
    User.findOne.mockResolvedValue(fakeUser);

    req.cookies.token = 'sometoken';

    await optionalAuth(req, res, next);

    expect(admin.auth().verifyIdToken).toHaveBeenCalledWith('sometoken');
    expect(User.findOne).toHaveBeenCalledWith({ uid: 'u-1' });
    expect(req.user).toBe(fakeUser);
    expect(next).toHaveBeenCalled();
  });
});

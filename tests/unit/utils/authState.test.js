import {
  getToken,
  setAuthUser,
  getAuthUser,
  getCurrentUserId,
  clearAuth,
  isOwner
} from '../../../src/services/authState';

describe('authState', () => {

  beforeEach(() => {
    localStorage.clear();
  });

  it('recognizes the reporter as owner even when the display name is anonymous', () => {
    setAuthUser({ _id: 'owner-1' }, 'test-token');
    expect(isOwner({ reportedBy: { _id: 'owner-1' }, user: 'Anonymous', owner: 'other-user' })).toBe(true);
    expect(isOwner({ reportedBy: 'owner-1', user: 'Anonymous' })).toBe(true);
    expect(isOwner({ reportedBy: 'other-user', user: 'Anonymous' })).toBe(false);
  });

  it('uses authenticated API ownership when locally stored user data is stale', () => {
    setAuthUser({ _id: 'stale-user' }, 'test-token');
    expect(isOwner({ reportedBy: 'owner-1', user: 'Anonymous', isOwner: true })).toBe(true);
    expect(isOwner({ reportedBy: 'stale-user', isOwner: false })).toBe(false);
  });

  describe('setAuthUser and getToken', () => {

    it('stores token in localStorage', () => {
      setAuthUser(
        { id: '123', name: 'Test User' },
        'test-token'
      );

      expect(getToken()).toBe('test-token');
    });

    it('does not store token when token is not provided', () => {
      setAuthUser(
        { id: '123', name: 'Test User' },
        null
      );

      expect(getToken()).toBeNull();
    });

  });

  describe('setAuthUser and getAuthUser', () => {

    it('stores and retrieves user correctly', () => {
      const user = {
        id: '123',
        name: 'Test User',
        role: 'user'
      };

      setAuthUser(user, 'test-token');

      expect(getAuthUser()).toEqual(user);
    });

    it('returns null when no user is stored', () => {
      expect(getAuthUser()).toBeNull();
    });

    it('returns null when stored user data is invalid JSON', () => {
      localStorage.setItem('user', 'invalid-json');

      expect(getAuthUser()).toBeNull();
    });

  });

  describe('getCurrentUserId', () => {

    it('returns user id when id exists', () => {
      setAuthUser(
        {
          id: '123',
          name: 'Test User'
        },
        'test-token'
      );

      expect(getCurrentUserId()).toBe('123');
    });

    it('returns _id when id does not exist', () => {
      setAuthUser(
        {
          _id: '456',
          name: 'Test User'
        },
        'test-token'
      );

      expect(getCurrentUserId()).toBe('456');
    });

    it('returns null when no user exists', () => {
      expect(getCurrentUserId()).toBeNull();
    });

  });

  describe('clearAuth', () => {

    it('removes token and user from localStorage', () => {
      const user = {
        id: '123',
        name: 'Test User'
      };

      setAuthUser(user, 'test-token');

      clearAuth();

      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });

  });

});

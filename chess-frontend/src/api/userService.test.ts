import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from './axios';
import {
  getMyProfile,
  getLeaderboard,
  getFullLeaderboard,
  updateMyProfile,
  changeMyPassword,
  deleteMyAccount,
  uploadAvatar,
  deleteAvatar,
} from './userService';

vi.mock('./axios', () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    post: vi.fn(),
  },
}));

describe('userService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getMyProfile calls api.get with correct url', async () => {
    // Arrange
    const mockResponse = { data: { id: 1, username: 'batuhan' } };
    vi.mocked(api.get).mockResolvedValueOnce(mockResponse);

    // Act
    const result = await getMyProfile();

    // Assert
    expect(api.get).toHaveBeenCalledWith('/api/users/me');
    expect(result).toEqual(mockResponse.data);
  });

  it('getLeaderboard calls api.get with correct url', async () => {
    // Arrange
    const mockResponse = { data: [{ id: 1, username: 'batuhan' }] };
    vi.mocked(api.get).mockResolvedValueOnce(mockResponse);

    // Act
    const result = await getLeaderboard();

    // Assert
    expect(api.get).toHaveBeenCalledWith('/api/users/leaderboard');
    expect(result).toEqual(mockResponse.data);
  });

  it('getFullLeaderboard calls api.get with correct params', async () => {
    // Arrange
    const mockResponse = { data: { content: [], totalPages: 1 } };
    vi.mocked(api.get).mockResolvedValueOnce(mockResponse);

    // Act
    const result = await getFullLeaderboard(0, 10);

    // Assert
    expect(api.get).toHaveBeenCalledWith('/api/users/leaderboard/all', {
      params: { page: 0, size: 10 },
    });
    expect(result).toEqual(mockResponse.data);
  });

  it('updateMyProfile calls api.put with correct data', async () => {
    // Arrange
    const updateData = { username: 'newname' };
    vi.mocked(api.put).mockResolvedValueOnce({});

    // Act
    await updateMyProfile(updateData as any);

    // Assert
    expect(api.put).toHaveBeenCalledWith('/api/users/me', updateData);
  });

  it('changeMyPassword calls api.put with correct data', async () => {
    // Arrange
    const passwordData = { oldPassword: '123', newPassword: '456' };
    vi.mocked(api.put).mockResolvedValueOnce({});

    // Act
    await changeMyPassword(passwordData as any);

    // Assert
    expect(api.put).toHaveBeenCalledWith('/api/users/me/password', passwordData);
  });

  it('deleteMyAccount calls api.delete with payload data', async () => {
    // Arrange
    const deleteData = { password: '123' };
    vi.mocked(api.delete).mockResolvedValueOnce({});

    // Act
    await deleteMyAccount(deleteData as any);

    // Assert
    expect(api.delete).toHaveBeenCalledWith('/api/users/me', { data: deleteData });
  });

  it('uploadAvatar calls api.post with multipart form data', async () => {
    // Arrange
    const file = new File(['dummy content'], 'avatar.png', { type: 'image/png' });
    const mockResponse = { data: { avatarUrl: '/path/to/avatar' } };
    vi.mocked(api.post).mockResolvedValueOnce(mockResponse);

    // Act
    const result = await uploadAvatar(file);

    // Assert
    expect(api.post).toHaveBeenCalledWith(
      '/api/users/me/avatar',
      expect.any(FormData),
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    expect(result).toEqual(mockResponse.data);
  });

  it('deleteAvatar calls api.delete with correct url', async () => {
    // Arrange
    vi.mocked(api.delete).mockResolvedValueOnce({});

    // Act
    await deleteAvatar();

    // Assert
    expect(api.delete).toHaveBeenCalledWith('/api/users/me/avatar');
  });
});

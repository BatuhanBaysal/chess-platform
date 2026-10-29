import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from './axios';
import {
  getAllUsers,
  deleteUserAccount,
  getActiveGames,
  forceFinishGame,
  triggerSandboxGame,
  getAuditLogs,
} from './adminService';

vi.mock('./axios', () => ({
  default: {
    get: vi.fn(),
    delete: vi.fn(),
    post: vi.fn(),
  },
}));

describe('adminService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getAllUsers calls api.get with correct params', async () => {
    // Arrange
    const mockResponse = { data: { content: [], totalPages: 1 } };
    vi.mocked(api.get).mockResolvedValueOnce(mockResponse);

    // Act
    const result = await getAllUsers(0, 10, 'all', 'test');

    // Assert
    expect(api.get).toHaveBeenCalledWith('/api/admin/users', {
      params: { page: 0, size: 10, filter: 'all', search: 'test' },
    });
    expect(result).toEqual(mockResponse.data);
  });

  it('deleteUserAccount calls api.delete with correct url', async () => {
    // Arrange
    vi.mocked(api.delete).mockResolvedValueOnce({});

    // Act
    await deleteUserAccount(1);

    // Assert
    expect(api.delete).toHaveBeenCalledWith('/api/admin/users/1');
  });

  it('getActiveGames calls api.get with correct url', async () => {
    // Arrange
    const mockResponse = { data: [] };
    vi.mocked(api.get).mockResolvedValueOnce(mockResponse);

    // Act
    const result = await getActiveGames();

    // Assert
    expect(api.get).toHaveBeenCalledWith('/api/admin/games/active');
    expect(result).toEqual(mockResponse.data);
  });

  it('forceFinishGame calls api.post with correct url', async () => {
    // Arrange
    vi.mocked(api.post).mockResolvedValueOnce({});

    // Act
    await forceFinishGame('game-1');

    // Assert
    expect(api.post).toHaveBeenCalledWith('/api/admin/games/game-1/force-finish');
  });

  it('triggerSandboxGame calls api.post with correct params', async () => {
    // Arrange
    vi.mocked(api.post).mockResolvedValueOnce({});

    // Act
    await triggerSandboxGame(1, 2);

    // Assert
    expect(api.post).toHaveBeenCalledWith('/api/admin/sandbox/trigger-game', null, {
      params: { whiteId: 1, blackId: 2 },
    });
  });

  it('getAuditLogs calls api.get with correct params', async () => {
    // Arrange
    const mockResponse = { data: { content: [] } };
    vi.mocked(api.get).mockResolvedValueOnce(mockResponse);

    // Act
    const result = await getAuditLogs(0, 10, 'LOGIN', 1);

    // Assert
    expect(api.get).toHaveBeenCalledWith('/api/admin/audit-logs', {
      params: { page: 0, size: 10, actionType: 'LOGIN', adminId: 1 },
    });
    expect(result).toEqual(mockResponse.data);
  });
});

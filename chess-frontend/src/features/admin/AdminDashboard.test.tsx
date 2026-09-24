import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AdminDashboard from './AdminDashboard';
import * as adminService from '../../api/adminService';

vi.mock('../../api/adminService', () => ({
  getAllUsers: vi.fn(),
  getActiveGames: vi.fn(),
  getAuditLogs: vi.fn(),
  deleteUserAccount: vi.fn(),
  forceFinishGame: vi.fn(),
  triggerSandboxGame: vi.fn(),
}));

describe('AdminDashboard Component', () => {
  beforeEach(() => {
    // Arrange
    vi.clearAllMocks();
    
    vi.mocked(adminService.getAllUsers).mockResolvedValue({
      content: [
        { id: 1, username: 'adminuser', email: 'admin@chess.com', role: 'ROLE_ADMIN' },
        { id: 2, username: 'testuser', email: 'test@chess.com', role: 'ROLE_USER' },
      ],
      totalPages: 1,
      totalElements: 2,
    } as any);

    vi.mocked(adminService.getActiveGames).mockResolvedValue([
      { gameId: 'game-1', whitePlayerId: 1, blackPlayerId: 2, status: 'IN_PROGRESS' },
    ] as any);

    vi.mocked(adminService.getAuditLogs).mockResolvedValue({
      content: [
        { id: 101, adminId: 1, actionType: 'DELETE_USER', details: 'Deleted user 5', createdAt: new Date().toISOString() },
      ],
      totalPages: 1,
      totalElements: 1,
    } as any);
  });

  it('renders admin control center header and loads panel data successfully', async () => {
    // Act
    render(<AdminDashboard />);

    // Assert
    expect(screen.getByText(/admin control center/i)).toBeDefined();

    // Act & Assert
    await waitFor(() => {
      expect(screen.getByText('testuser')).toBeDefined();
      expect(screen.getByText('game-1')).toBeDefined();
      expect(screen.getByText('DELETE_USER')).toBeDefined();
    });
  });
});

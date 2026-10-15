import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
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
    vi.useRealTimers();
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

  it('renders admin control center header and default user management list', async () => {
    // Arrange
    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    // Act
    const controlCenterHeader = screen.getByText(/admin control center/i);

    // Assert
    expect(controlCenterHeader).toBeDefined();
    await waitFor(() => {
      expect(screen.getByText('testuser')).toBeDefined();
    });
  });

  it('displays active game sessions when switching to sessions tab', async () => {
    // Arrange
    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText('testuser')).toBeDefined();
    });

    // Act
    const sessionsTabButton = screen.getByRole('button', { name: /sessions/i });
    fireEvent.click(sessionsTabButton);

    // Assert
    await waitFor(() => {
      expect(screen.getByText('game-1')).toBeDefined();
    });
  });

  it('displays audit log entries when switching to logs tab', async () => {
    // Arrange
    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText('testuser')).toBeDefined();
    });

    // Act
    const logsTabButton = screen.getByRole('button', { name: /logs/i });
    fireEvent.click(logsTabButton);

    // Assert
    await waitFor(() => {
      expect(screen.getByText('DELETE_USER')).toBeDefined();
    });
  });
});

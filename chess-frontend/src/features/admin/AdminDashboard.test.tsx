import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
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
    // Arrange
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

    vi.mocked(adminService.triggerSandboxGame).mockResolvedValue({} as any);
  });

  it('renders admin control center header and default user management list', async () => {
    // Arrange & Act
    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    // Assert
    expect(screen.getByText(/admin control center/i)).toBeDefined();
    await waitFor(() => {
      expect(screen.getByText('testuser')).toBeDefined();
    });
  });

  it('displays active game sessions and terminates session when confirmed', async () => {
    // Arrange
    vi.spyOn(window, 'confirm').mockImplementation(() => true);
    vi.mocked(adminService.forceFinishGame).mockResolvedValue({} as any);

    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText('testuser')).toBeDefined();
    });

    // Act
    fireEvent.click(screen.getByRole('button', { name: /sessions/i }));

    // Assert
    await waitFor(() => {
      expect(screen.getByText('game-1')).toBeDefined();
    });

    const terminateBtn = screen.getByRole('button', { name: /terminate/i });
    fireEvent.click(terminateBtn);

    await waitFor(() => {
      expect(adminService.forceFinishGame).toHaveBeenCalledWith('game-1');
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
    fireEvent.click(screen.getByRole('button', { name: /logs/i }));

    // Assert
    await waitFor(() => {
      expect(screen.getByText('DELETE_USER')).toBeDefined();
    });
  });

  it('disables delete button and triggers deletion when confirmed', async () => {
    // Arrange
    vi.spyOn(window, 'confirm').mockImplementation(() => true);
    vi.mocked(adminService.deleteUserAccount).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('testuser')).toBeDefined();
    });

    // Act
    const testUserRow = screen.getByText('testuser').closest('tr')!;
    const deleteButton = within(testUserRow).getByTitle('Delete User') as HTMLButtonElement;
    
    fireEvent.click(deleteButton);

    // Assert
    expect(deleteButton.disabled).toBe(true);
    await waitFor(() => {
      expect(adminService.deleteUserAccount).toHaveBeenCalledWith(2);
    });
  });

  it('renders sandbox trigger panel and dispatches test match on form submit', async () => {
    // Arrange
    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    // Act
    fireEvent.click(screen.getByRole('button', { name: /sandbox/i }));

    // Assert
    expect(screen.getByText(/developer sandbox trigger/i)).toBeDefined();

    const whiteIdInput = screen.getByLabelText(/white player id/i);
    const blackIdInput = screen.getByLabelText(/black player id/i);
    const submitBtn = screen.getByRole('button', { name: /create test match/i });

    // Act
    fireEvent.change(whiteIdInput, { target: { value: '10' } });
    fireEvent.change(blackIdInput, { target: { value: '20' } });
    fireEvent.click(submitBtn);

    // Assert
    await waitFor(() => {
      expect(adminService.triggerSandboxGame).toHaveBeenCalledWith(10, 20);
      expect(screen.getByText(/sandbox event dispatched successfully!/i)).toBeDefined();
    });
  });

  it('filters users when clicking member and guest category buttons', async () => {
    // Arrange
    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('testuser')).toBeDefined();
    });

    // Act & Assert
    const guestsBtn = screen.getByRole('button', { name: /guest accounts/i });
    fireEvent.click(guestsBtn);

    await waitFor(() => {
      expect(adminService.getAllUsers).toHaveBeenCalledWith(0, 10, 'guests', '');
    });

    // Act & Assert
    const membersBtn = screen.getByRole('button', { name: /registered members/i });
    fireEvent.click(membersBtn);

    await waitFor(() => {
      expect(adminService.getAllUsers).toHaveBeenCalledWith(0, 10, 'members', '');
    });
  });

  it('handles search input query and triggers filtered users data fetch', async () => {
    // Arrange
    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('testuser')).toBeDefined();
    });

    const searchInput = screen.getByRole('textbox');

    // Act
    fireEvent.change(searchInput, { target: { value: 'grandmaster' } });

    // Assert
    await waitFor(() => {
      expect(adminService.getAllUsers).toHaveBeenCalledWith(0, 10, 'all', 'grandmaster');
    });
  });

  it('refreshes all panels when Refresh All button is clicked', async () => {
    // Arrange
    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /refresh all/i })).toBeDefined();
    });

    const refreshBtn = screen.getByRole('button', { name: /refresh all/i });

    // Act
    fireEvent.click(refreshBtn);

    // Assert
    await waitFor(() => {
      expect(adminService.getAllUsers).toHaveBeenCalled();
      expect(adminService.getActiveGames).toHaveBeenCalled();
      expect(adminService.getAuditLogs).toHaveBeenCalled();
    });
  });
});

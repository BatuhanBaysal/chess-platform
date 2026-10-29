import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LobbyRoomsList from './LobbyRoomsList';
import type { GameRoom } from '../hooks/useLobby';

describe('LobbyRoomsList Component', () => {
  it('renders empty message when no open matches exist', () => {
    // Arrange & Act
    render(<LobbyRoomsList rooms={[]} onJoinRoom={vi.fn()} />);

    // Assert
    expect(screen.getByText(/0 open/i)).toBeDefined();
    expect(screen.getByText(/no open matches available/i)).toBeDefined();
  });

  it('renders available room cards and triggers onJoinRoom on button click', () => {
    // Arrange
    const handleJoin = vi.fn();
    const mockRooms: GameRoom[] = [
      {
        roomId: 'room-101',
        hostName: 'batuchess',
        timeLimit: 10,
        theme: 'classic',
      },
    ];

    // Act
    render(<LobbyRoomsList rooms={mockRooms} onJoinRoom={handleJoin} />);

    // Assert
    expect(screen.getByText(/1 open/i)).toBeDefined();
    expect(screen.getByText('batuchess')).toBeDefined();
    expect(screen.getByText(/10 min • classic/i)).toBeDefined();

    // Act
    const joinBtn = screen.getByRole('button', { name: /join match/i });
    fireEvent.click(joinBtn);

    // Assert
    expect(handleJoin).toHaveBeenCalledWith(mockRooms[0]);
  });
});

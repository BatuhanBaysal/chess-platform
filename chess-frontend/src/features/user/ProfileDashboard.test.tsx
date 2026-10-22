import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import ProfileDashboard from './ProfileDashboard';
import * as userService from '../../api/userService';
import * as authHook from '../../hooks/useAuth';

vi.mock('../../api/userService', () => ({
  getMyProfile: vi.fn(),
  updateMyProfile: vi.fn(),
  changeMyPassword: vi.fn(),
  deleteMyAccount: vi.fn(),
  uploadAvatar: vi.fn(),
  deleteAvatar: vi.fn(),
}));

vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

describe('ProfileDashboard Component', () => {
  const mockLogout = vi.fn();

  beforeEach(() => {
    // Arrange
    vi.clearAllMocks();
    vi.mocked(authHook.useAuth).mockReturnValue({ logout: mockLogout } as any);

    global.URL.createObjectURL = vi.fn(() => 'blob:http://localhost/mock-avatar');
    window.confirm = vi.fn(() => true);

    vi.mocked(userService.getMyProfile).mockResolvedValue({
      username: 'batuhan',
      email: 'batuhan@chessplatform.com',
      avatarUrl: null,
    } as any);
  });

  it('renders profile data and initial fallback successfully', async () => {
    // Arrange
    const expectedUsername = 'batuhan';
    const expectedEmail = 'batuhan@chessplatform.com';
    const expectedFallbackInitial = 'B';

    // Act
    render(
      <MemoryRouter>
        <ProfileDashboard />
      </MemoryRouter>
    );

    // Assert
    await waitFor(() => {
      expect(screen.getByDisplayValue(expectedUsername)).toBeDefined();
      expect(screen.getByDisplayValue(expectedEmail)).toBeDefined();
      expect(screen.getByText(expectedFallbackInitial)).toBeDefined();
    });
  });

  it('renders avatar image when avatarUrl exists in profile data', async () => {
    // Arrange
    const avatarUrl = '/api/users/batuhan/avatar';
    vi.mocked(userService.getMyProfile).mockResolvedValue({
      username: 'batuhan',
      email: 'batuhan@chessplatform.com',
      avatarUrl,
    } as any);

    // Act
    render(
      <MemoryRouter>
        <ProfileDashboard />
      </MemoryRouter>
    );

    // Assert
    await waitFor(() => {
      const avatarImg = screen.getByRole('img', { name: 'batuhan' }) as HTMLImageElement;
      expect(avatarImg).toBeDefined();
      expect(avatarImg.src).toContain(avatarUrl);
      expect(screen.getByRole('button', { name: /remove/i })).toBeDefined();
    });
  });

  it('rejects file larger than 2MB with validation error', async () => {
    // Arrange
    render(
      <MemoryRouter>
        <ProfileDashboard />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByDisplayValue('batuhan')).toBeDefined();
    });

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const oversizedFile = new File([new ArrayBuffer(2.5 * 1024 * 1024)], 'large.png', {
      type: 'image/png',
    });

    // Act
    fireEvent.change(fileInput, { target: { files: [oversizedFile] } });

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Avatar file size must not exceed 2MB.')).toBeDefined();
    });
    expect(userService.uploadAvatar).not.toHaveBeenCalled();
  });

  it('rejects unsupported file mime types', async () => {
    // Arrange
    render(
      <MemoryRouter>
        <ProfileDashboard />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByDisplayValue('batuhan')).toBeDefined();
    });

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const unsupportedFile = new File(['plain text'], 'document.txt', { type: 'text/plain' });

    // Act
    fireEvent.change(fileInput, { target: { files: [unsupportedFile] } });

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Only JPG, PNG, and WEBP formats are supported.')).toBeDefined();
    });
    expect(userService.uploadAvatar).not.toHaveBeenCalled();
  });

  it('uploads valid PNG avatar, updates UI and dispatches avatarUpdated event', async () => {
    // Arrange
    const validFile = new File(['valid png data'], 'avatar.png', { type: 'image/png' });
    const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');
    vi.mocked(userService.uploadAvatar).mockResolvedValue({
      avatarUrl: '/api/users/batuhan/avatar',
      message: 'Avatar updated successfully!',
    } as any);

    render(
      <MemoryRouter>
        <ProfileDashboard />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByDisplayValue('batuhan')).toBeDefined();
    });

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    // Act
    fireEvent.change(fileInput, { target: { files: [validFile] } });

    // Assert
    await waitFor(() => {
      expect(userService.uploadAvatar).toHaveBeenCalledWith(validFile);
      expect(screen.getByText('Avatar updated successfully!')).toBeDefined();
      expect(dispatchEventSpy).toHaveBeenCalledWith(expect.objectContaining({ type: 'avatarUpdated' }));
    });
  });

  it('deletes avatar and reverts to initial fallback when remove button is clicked', async () => {
    // Arrange
    vi.mocked(userService.getMyProfile).mockResolvedValue({
      username: 'batuhan',
      email: 'batuhan@chessplatform.com',
      avatarUrl: '/api/users/batuhan/avatar',
    } as any);
    vi.mocked(userService.deleteAvatar).mockResolvedValue(undefined as any);
    const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');

    render(
      <MemoryRouter>
        <ProfileDashboard />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /remove/i })).toBeDefined();
    });

    const removeBtn = screen.getByRole('button', { name: /remove/i });

    // Act
    fireEvent.click(removeBtn);

    // Assert
    await waitFor(() => {
      expect(userService.deleteAvatar).toHaveBeenCalledTimes(1);
      expect(screen.getByText('Avatar removed successfully.')).toBeDefined();
      expect(screen.getByText('B')).toBeDefined();
      expect(dispatchEventSpy).toHaveBeenCalledWith(expect.objectContaining({ type: 'avatarUpdated' }));
    });
  });
});

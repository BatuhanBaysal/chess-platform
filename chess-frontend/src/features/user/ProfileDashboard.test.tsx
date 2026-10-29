import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import ProfileDashboard from './ProfileDashboard';
import * as userService from '../../api/userService';
import * as authHook from '../../hooks/useAuth';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

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
    window.alert = vi.fn();

    vi.mocked(userService.getMyProfile).mockResolvedValue({
      username: 'batuhan',
      email: 'batuhan@chessplatform.com',
      avatarUrl: null,
    } as any);
  });

  it('renders profile data and initial fallback successfully', async () => {
    // Arrange & Act
    render(
      <MemoryRouter>
        <ProfileDashboard />
      </MemoryRouter>
    );

    // Assert
    await waitFor(() => {
      expect(screen.getByDisplayValue('batuhan')).toBeDefined();
      expect(screen.getByDisplayValue('batuhan@chessplatform.com')).toBeDefined();
      expect(screen.getByText('B')).toBeDefined();
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

  it('handles avatar upload failure and shows error banner', async () => {
    // Arrange
    const validFile = new File(['valid png data'], 'avatar.png', { type: 'image/png' });
    vi.mocked(userService.uploadAvatar).mockRejectedValueOnce({
      response: { data: { message: 'Image upload failed on server' } },
    });

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
      expect(screen.getByText('Image upload failed on server')).toBeDefined();
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

  it('updates profile details and logs out user on successful save', async () => {
    // Arrange
    vi.mocked(userService.updateMyProfile).mockResolvedValueOnce(undefined as any);

    render(
      <MemoryRouter>
        <ProfileDashboard />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByDisplayValue('batuhan')).toBeDefined();
    });

    const editBtn = screen.getByRole('button', { name: /edit profile/i });
    fireEvent.click(editBtn);

    const emailInput = screen.getByDisplayValue('batuhan@chessplatform.com');
    fireEvent.change(emailInput, { target: { value: 'newemail@chessplatform.com' } });

    const saveBtn = screen.getByRole('button', { name: /save changes/i });

    // Act
    fireEvent.click(saveBtn);

    // Assert
    await waitFor(() => {
      expect(userService.updateMyProfile).toHaveBeenCalledWith({
        username: 'batuhan',
        email: 'newemail@chessplatform.com',
      });
      expect(mockLogout).toHaveBeenCalledTimes(1);
    });
  });

  it('handles profile update failure and renders error banner', async () => {
    // Arrange
    vi.mocked(userService.updateMyProfile).mockRejectedValueOnce({
      response: { data: { message: 'Username is already taken.' } },
    });

    render(
      <MemoryRouter>
        <ProfileDashboard />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByDisplayValue('batuhan')).toBeDefined();
    });

    const editBtn = screen.getByRole('button', { name: /edit profile/i });
    fireEvent.click(editBtn);

    const usernameInput = screen.getByDisplayValue('batuhan');
    fireEvent.change(usernameInput, { target: { value: 'takenuser' } });

    const saveBtn = screen.getByRole('button', { name: /save changes/i });

    // Act
    fireEvent.click(saveBtn);

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Username is already taken.')).toBeDefined();
    });
  });

  it('cancels edit mode and restores original profile data when Cancel is clicked', async () => {
    // Arrange
    render(
      <MemoryRouter>
        <ProfileDashboard />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByDisplayValue('batuhan')).toBeDefined();
    });

    const editBtn = screen.getByRole('button', { name: /edit profile/i });
    fireEvent.click(editBtn);

    const usernameInput = screen.getByDisplayValue('batuhan');
    fireEvent.change(usernameInput, { target: { value: 'modifiedname' } });

    const cancelBtn = screen.getByRole('button', { name: /cancel/i });

    // Act
    fireEvent.click(cancelBtn);

    // Assert
    await waitFor(() => {
      expect(screen.getByDisplayValue('batuhan')).toBeDefined();
    });
  });

  it('changes password successfully when current and strong new password are provided', async () => {
    // Arrange
    vi.mocked(userService.changeMyPassword).mockResolvedValueOnce(undefined as any);

    render(
      <MemoryRouter>
        <ProfileDashboard />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Current Password')).toBeDefined();
    });

    const currentPassInput = screen.getByPlaceholderText('Current Password');
    const newPassInput = screen.getByPlaceholderText('New Password');
    const changePassBtn = screen.getByRole('button', { name: /change password/i });

    // Act
    fireEvent.change(currentPassInput, { target: { value: 'oldPass123' } });
    fireEvent.change(newPassInput, { target: { value: 'strongPass123' } });
    fireEvent.click(changePassBtn);

    // Assert
    await waitFor(() => {
      expect(userService.changeMyPassword).toHaveBeenCalledWith({
        currentPassword: 'oldPass123',
        newPassword: 'strongPass123',
      });
      expect(mockLogout).toHaveBeenCalledTimes(1);
    });
  });

  it('displays error banner when password update fails on backend', async () => {
    // Arrange
    vi.mocked(userService.changeMyPassword).mockRejectedValueOnce({
      response: { data: { message: 'Current password is incorrect' } },
    });

    render(
      <MemoryRouter>
        <ProfileDashboard />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Current Password')).toBeDefined();
    });

    const currentPassInput = screen.getByPlaceholderText('Current Password');
    const newPassInput = screen.getByPlaceholderText('New Password');
    const changePassBtn = screen.getByRole('button', { name: /change password/i });

    // Act
    fireEvent.change(currentPassInput, { target: { value: 'wrongOldPass' } });
    fireEvent.change(newPassInput, { target: { value: 'newStrongPass1' } });
    fireEvent.click(changePassBtn);

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Current password is incorrect')).toBeDefined();
    });
  });

  it('deletes account when confirmed with password in danger zone', async () => {
    // Arrange
    vi.mocked(userService.deleteMyAccount).mockResolvedValueOnce(undefined as any);

    render(
      <MemoryRouter>
        <ProfileDashboard />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Confirm password to delete')).toBeDefined();
    });

    const deletePassInput = screen.getByPlaceholderText('Confirm password to delete');
    const deleteBtn = screen.getByRole('button', { name: /delete my account/i });

    // Act
    fireEvent.change(deletePassInput, { target: { value: 'secret123' } });
    fireEvent.click(deleteBtn);

    // Assert
    await waitFor(() => {
      expect(userService.deleteMyAccount).toHaveBeenCalledWith({
        password: 'secret123',
      });
      expect(mockLogout).toHaveBeenCalledTimes(1);
    });
  });

  it('navigates back to menu when Back to Menu button is clicked', async () => {
    // Arrange
    render(
      <MemoryRouter>
        <ProfileDashboard />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /back to menu/i })).toBeDefined();
    });

    const backBtn = screen.getByRole('button', { name: /back to menu/i });

    // Act
    fireEvent.click(backBtn);

    // Assert
    expect(mockNavigate).toHaveBeenCalledWith('/menu');
  });

  it('renders nothing when initial profile load fails', async () => {
    // Arrange
    vi.mocked(userService.getMyProfile).mockRejectedValueOnce(new Error('Network error'));

    // Act
    const { container } = render(
      <MemoryRouter>
        <ProfileDashboard />
      </MemoryRouter>
    );

    // Assert
    await waitFor(() => {
      expect(container.firstChild).toBeNull();
    });
  });
});

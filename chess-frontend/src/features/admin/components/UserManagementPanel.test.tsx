import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import UserManagementPanel from './UserManagementPanel';

describe('UserManagementPanel Component', () => {
  const mockUsers = [
    { id: 1, username: 'admin_user', email: 'admin@test.com', role: 'ROLE_ADMIN' },
    { id: 2, username: 'guest_123', email: '', role: 'ROLE_GUEST' },
    { id: 3, username: 'member_user', email: 'member@test.com', role: 'ROLE_USER' },
  ];

  const defaultProps = {
    users: mockUsers as any,
    loading: false,
    currentPage: 0,
    totalPages: 1,
    totalElements: 3,
    selectedCategory: 'all' as const,
    searchQuery: '',
    onSearchChange: vi.fn(),
    onFilterChange: vi.fn(),
    onPageChange: vi.fn(),
    onDeleteUser: vi.fn(),
    deletingUserId: null,
  };

  beforeEach(() => {
    // Arrange
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it('renders user list with role badges and emails properly', () => {
    // Arrange & Act
    render(<UserManagementPanel {...defaultProps} />);

    // Assert
    expect(screen.getByText('admin_user')).toBeDefined();
    expect(screen.getByText('guest_123')).toBeDefined();
    expect(screen.getByText('member_user')).toBeDefined();
    expect(screen.getByText('ADMIN')).toBeDefined();
    expect(screen.getByText('GUEST')).toBeDefined();
    expect(screen.getByText('USER')).toBeDefined();
  });

  it('handles search input change with debounce timer', () => {
    // Arrange
    vi.useFakeTimers();
    render(<UserManagementPanel {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText(/filter by name, email.../i);

    // Act
    fireEvent.change(searchInput, { target: { value: 'batuhan' } });

    // Assert
    expect(defaultProps.onSearchChange).not.toHaveBeenCalled();

    // Act
    act(() => {
      vi.advanceTimersByTime(350);
    });

    // Assert
    expect(defaultProps.onSearchChange).toHaveBeenCalledWith('batuhan');
    vi.useRealTimers();
  });

  it('triggers onFilterChange when category filter buttons are clicked', () => {
    // Arrange
    render(<UserManagementPanel {...defaultProps} />);

    // Act & Assert
    fireEvent.click(screen.getByRole('button', { name: /registered members/i }));
    expect(defaultProps.onFilterChange).toHaveBeenCalledWith('members');

    fireEvent.click(screen.getByRole('button', { name: /guest accounts/i }));
    expect(defaultProps.onFilterChange).toHaveBeenCalledWith('guests');

    fireEvent.click(screen.getByRole('button', { name: /all users/i }));
    expect(defaultProps.onFilterChange).toHaveBeenCalledWith('all');
  });

  it('triggers onDeleteUser when delete button is clicked for eligible user', () => {
    // Arrange
    render(<UserManagementPanel {...defaultProps} />);
    const deleteButtons = screen.getAllByTitle('Delete User');

    // Assert
    expect((deleteButtons[0] as HTMLButtonElement).disabled).toBe(true);

    // Act
    fireEvent.click(deleteButtons[2]);

    // Assert
    expect(defaultProps.onDeleteUser).toHaveBeenCalledWith(3);
  });

  it('renders loading indicator when loading prop is true', () => {
    // Arrange & Act
    render(<UserManagementPanel {...defaultProps} loading={true} />);

    // Assert
    expect(screen.getByText(/loading users.../i)).toBeDefined();
  });

  it('renders empty fallback row when user list is empty', () => {
    // Arrange & Act
    render(<UserManagementPanel {...defaultProps} users={[]} totalElements={0} />);

    // Assert
    expect(screen.getByText(/no users match criteria/i)).toBeDefined();
  });
});

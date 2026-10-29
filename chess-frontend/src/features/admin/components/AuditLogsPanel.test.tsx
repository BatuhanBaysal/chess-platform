import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AuditLogsPanel from './AuditLogsPanel';

describe('AuditLogsPanel Component', () => {
  const defaultProps = {
    auditLogs: [
      {
        id: 501,
        adminId: 1,
        actionType: 'FORCE_TERMINATE',
        details: 'Terminated session game-42',
        createdAt: '2026-10-27T10:00:00Z',
      },
    ] as any,
    loading: false,
    auditPage: 0,
    auditTotalPages: 2,
    auditTotalElements: 12,
    onAuditPageChange: vi.fn(),
  };

  it('renders audit logs table with action badges and formatted details', () => {
    // Arrange & Act
    render(<AuditLogsPanel {...defaultProps} />);

    // Assert
    expect(screen.getByText('#501')).toBeDefined();
    expect(screen.getByText('FORCE_TERMINATE')).toBeDefined();
    expect(screen.getByText('Terminated session game-42')).toBeDefined();
  });

  it('triggers onAuditPageChange when pagination buttons are clicked', () => {
    // Arrange
    render(<AuditLogsPanel {...defaultProps} />);

    // Act
    const nextBtn = screen.getByRole('button', { name: /next page/i });
    fireEvent.click(nextBtn);

    // Assert
    expect(defaultProps.onAuditPageChange).toHaveBeenCalledWith(1);
  });

  it('renders loading view when loading is true', () => {
    // Arrange & Act
    render(<AuditLogsPanel {...defaultProps} loading={true} />);

    // Assert
    expect(screen.getByText(/streaming logs.../i)).toBeDefined();
  });

  it('renders empty notice when auditLogs array is empty', () => {
    // Arrange & Act
    render(<AuditLogsPanel {...defaultProps} auditLogs={[]} auditTotalElements={0} />);

    // Assert
    expect(screen.getAllByText(/no audit trail recorded/i).length).toBeGreaterThan(0);
  });
});

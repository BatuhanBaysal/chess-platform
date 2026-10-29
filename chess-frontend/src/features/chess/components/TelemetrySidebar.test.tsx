import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeAll, vi } from 'vitest';
import TelemetrySidebar from './TelemetrySidebar';

describe('TelemetrySidebar Component', () => {
  beforeAll(() => {
    Element.prototype.scrollTo = vi.fn();
  });

  it('renders unique telemetry logs with appropriate turn styling', () => {
    // Arrange
    const logs = [
      { time: '12:00:00', text: 'Game started. White to move.', turn: 'WHITE' },
      { time: '12:00:05', text: 'e4 played', turn: 'WHITE' },
      { time: '12:00:05', text: 'e4 played', turn: 'WHITE' },
      { time: '12:00:10', text: 'e5 played', turn: 'BLACK' },
    ];

    // Act
    render(<TelemetrySidebar logs={logs} />);

    // Assert
    expect(screen.getByText(/game started/i)).toBeDefined();
    expect(screen.getAllByText('e4 played')).toHaveLength(1);
    expect(screen.getByText('e5 played')).toBeDefined();
  });

  it('updates scroll position state on user scroll', () => {
    // Arrange
    const logs = [{ time: '12:00:00', text: 'Move 1', turn: 'WHITE' }];
    const { container } = render(<TelemetrySidebar logs={logs} />);
    const scrollContainer = container.querySelector('.overflow-y-auto')!;

    // Act
    Object.defineProperty(scrollContainer, 'scrollTop', { value: 50, writable: true });
    fireEvent.scroll(scrollContainer);

    // Assert
    expect(scrollContainer.scrollTop).toBe(50);
  });
});

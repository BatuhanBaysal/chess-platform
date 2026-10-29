import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeAll, vi } from 'vitest';
import NotationSidebar from './NotationSidebar';

describe('NotationSidebar Component', () => {
  beforeAll(() => {
    // Arrange
    Element.prototype.scrollTo = vi.fn();
  });

  it('renders move notations and evaluation quality badges', () => {
    // Arrange
    const pairedMoves = [
      { index: 1, white: 'e4', black: 'e5', whiteQuality: 'BLUNDER', blackQuality: 'MISTAKE' },
      { index: 2, white: 'Nf3', whiteQuality: 'INACCURACY' },
    ];

    // Act
    render(<NotationSidebar pairedMoves={pairedMoves as any} />);

    // Assert
    expect(screen.getByText('e4')).toBeDefined();
    expect(screen.getByTitle('Blunder')).toBeDefined();
    expect(screen.getByTitle('?')).toBeDefined();
    expect(screen.getByTitle('?!')).toBeDefined();
    expect(screen.getByText('Nf3')).toBeDefined();
    expect(screen.getByText('...')).toBeDefined();
  });
});

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import EvaluationBar from './EvaluationBar';

describe('EvaluationBar Component', () => {
  it('renders standard centipawn positive score and white player label', () => {
    // Arrange
    const props = {
      score: 150,
      evaluationType: 'CP' as const,
      orientation: 'WHITE' as const,
    };

    // Act
    render(<EvaluationBar {...props} />);

    // Assert
    expect(screen.getByText(/You \(White\)/i)).toBeDefined();
    expect(screen.getByText('Evaluation: +1.5')).toBeDefined();
  });

  it('renders negative score with rose accent when black is favored', () => {
    // Arrange
    const props = {
      score: -250,
      evaluationType: 'CP' as const,
      orientation: 'BLACK' as const,
    };

    // Act
    render(<EvaluationBar {...props} />);

    // Assert
    expect(screen.getByText(/You \(Black\)/i)).toBeDefined();
    expect(screen.getByText('Evaluation: -2.5')).toBeDefined();
  });

  it('renders forced mate telemetry properly for positive mate score', () => {
    // Arrange
    const props = {
      score: 9800,
      evaluationType: 'MATE' as const,
      orientation: 'WHITE' as const,
    };

    // Act
    render(<EvaluationBar {...props} />);

    // Assert
    expect(screen.getByText(/Mate in \+2/i)).toBeDefined();
  });

  it('renders forced mate telemetry properly for negative mate score', () => {
    // Arrange
    const props = {
      score: -3,
      evaluationType: 'MATE' as const,
      orientation: 'BLACK' as const,
    };

    // Act
    render(<EvaluationBar {...props} />);

    // Assert
    expect(screen.getByText(/Mate in -3/i)).toBeDefined();
  });
});

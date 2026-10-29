import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Tooltip } from './Tooltip';

describe('Tooltip Component', () => {
  it('renders children correctly and shows tooltip content on mouse enter', () => {
    // Arrange
    render(
      <Tooltip content="Helper Info">
        <button type="button">Hover Me</button>
      </Tooltip>
    );
    const triggerElement = screen.getByRole('button', { name: /hover me/i });

    // Act
    fireEvent.mouseEnter(triggerElement);

    // Assert
    const tooltipElement = screen.getByRole('tooltip');
    expect(tooltipElement).toBeDefined();
    expect(tooltipElement.textContent).toContain('Helper Info');
  });

  it('hides tooltip content on mouse leave', () => {
    // Arrange
    render(
      <Tooltip content="Helper Info" position="bottom">
        <button type="button">Hover Me</button>
      </Tooltip>
    );
    const triggerElement = screen.getByRole('button', { name: /hover me/i });

    // Act
    fireEvent.mouseEnter(triggerElement);
    fireEvent.mouseLeave(triggerElement);

    // Assert
    const tooltipElement = screen.queryByRole('tooltip');
    expect(tooltipElement).toBeNull();
  });

  it('shows tooltip content on focus and hides on blur', () => {
    // Arrange
    render(
      <Tooltip content="Keyboard accessible tooltip" position="top">
        <button type="button">Focus Me</button>
      </Tooltip>
    );
    const triggerElement = screen.getByRole('button', { name: /focus me/i });

    // Act
    fireEvent.focus(triggerElement.parentElement!);

    // Assert
    expect(screen.getByRole('tooltip')).toBeDefined();
    expect(screen.getByRole('tooltip').textContent).toContain('Keyboard accessible tooltip');

    // Act
    fireEvent.blur(triggerElement.parentElement!);

    // Assert
    expect(screen.queryByRole('tooltip')).toBeNull();
  });
});

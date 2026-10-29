import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MatchDistributionGraph } from './MatchDistributionGraph';
import type { MatchDistributionItem } from './MatchDistributionGraph';

vi.mock('recharts', async () => {
  const actual = await vi.importActual('recharts');
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="responsive-container" style={{ width: 500, height: 200 }}>
        {children}
      </div>
    ),
    Legend: ({ formatter }: { formatter?: (val: string) => React.ReactNode }) => (
      <div data-testid="mock-legend">
        {formatter ? formatter('Wins') : null}
      </div>
    ),
    PieChart: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="mock-pie-chart">{children}</div>
    ),
    Pie: () => <div data-testid="mock-pie" />,
    Tooltip: () => null,
  };
});

describe('MatchDistributionGraph Component', () => {
  it('renders graph container, pie and legend formatter properly with data items', () => {
    // Arrange
    const mockData: MatchDistributionItem[] = [
      { name: 'Wins', value: 10, fill: '#10b981' },
      { name: 'Losses', value: 5, fill: '#ef4444' },
      { name: 'Draws', value: 2, fill: '#64748b' },
    ];

    // Act
    render(<MatchDistributionGraph data={mockData} />);

    // Assert
    expect(screen.getByTestId('responsive-container')).toBeDefined();
    expect(screen.getByTestId('mock-pie-chart')).toBeDefined();
    expect(screen.getByTestId('mock-legend')).toBeDefined();
    expect(screen.getByText('Wins')).toBeDefined();
  });
});

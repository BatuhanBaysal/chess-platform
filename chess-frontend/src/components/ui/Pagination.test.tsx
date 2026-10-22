import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Pagination, { getPaginationRange } from './Pagination';

describe('Pagination Component & Helper', () => {
  describe('getPaginationRange Helper', () => {
    it('returns empty array when totalPages <= 1', () => {
      // Arrange
      const singlePage = 1;
      const zeroPages = 0;

      // Act
      const resultSingle = getPaginationRange(1, singlePage);
      const resultZero = getPaginationRange(1, zeroPages);

      // Assert
      expect(resultSingle).toEqual([]);
      expect(resultZero).toEqual([]);
    });

    it('returns all pages when totalPages <= total allowed slots', () => {
      // Arrange
      const currentPage = 1;
      const totalPages = 5;

      // Act
      const range = getPaginationRange(currentPage, totalPages);

      // Assert
      expect(range).toEqual([1, 2, 3, 4, 5]);
    });

    it('places ellipsis on the right when current page is near start', () => {
      // Arrange
      const currentPage = 2;
      const totalPages = 10;

      // Act
      const range = getPaginationRange(currentPage, totalPages);

      // Assert
      expect(range).toEqual([1, 2, 3, 4, 5, 'ellipsis', 10]);
    });

    it('places ellipsis on the left when current page is near end', () => {
      // Arrange
      const currentPage = 9;
      const totalPages = 10;

      // Act
      const range = getPaginationRange(currentPage, totalPages);

      // Assert
      expect(range).toEqual([1, 'ellipsis', 6, 7, 8, 9, 10]);
    });

    it('places ellipsis on both sides when current page is in the middle', () => {
      // Arrange
      const currentPage = 10;
      const totalPages = 20;

      // Act
      const range = getPaginationRange(currentPage, totalPages);

      // Assert
      expect(range).toEqual([1, 'ellipsis', 9, 10, 11, 'ellipsis', 20]);
    });
  });

  describe('Pagination Rendering & Interactions', () => {
    it('renders nothing when totalPages is 1 or less', () => {
      // Arrange & Act
      const { container } = render(
        <Pagination currentPage={1} totalPages={1} onPageChange={vi.fn()} />
      );

      // Assert
      expect(container.firstChild).toBeNull();
    });

    it('disables << and < buttons on first page', () => {
      // Arrange
      render(<Pagination currentPage={1} totalPages={10} onPageChange={vi.fn()} />);

      // Act
      const firstBtn = screen.getByLabelText(/go to first page/i) as HTMLButtonElement;
      const prevBtn = screen.getByLabelText(/go to previous page/i) as HTMLButtonElement;
      const nextBtn = screen.getByLabelText(/go to next page/i) as HTMLButtonElement;
      const lastBtn = screen.getByLabelText(/go to last page/i) as HTMLButtonElement;

      // Assert
      expect(firstBtn.disabled).toBe(true);
      expect(prevBtn.disabled).toBe(true);
      expect(nextBtn.disabled).toBe(false);
      expect(lastBtn.disabled).toBe(false);
    });

    it('disables > and >> buttons on last page', () => {
      // Arrange
      render(<Pagination currentPage={10} totalPages={10} onPageChange={vi.fn()} />);

      // Act
      const firstBtn = screen.getByLabelText(/go to first page/i) as HTMLButtonElement;
      const prevBtn = screen.getByLabelText(/go to previous page/i) as HTMLButtonElement;
      const nextBtn = screen.getByLabelText(/go to next page/i) as HTMLButtonElement;
      const lastBtn = screen.getByLabelText(/go to last page/i) as HTMLButtonElement;

      // Assert
      expect(firstBtn.disabled).toBe(false);
      expect(prevBtn.disabled).toBe(false);
      expect(nextBtn.disabled).toBe(true);
      expect(lastBtn.disabled).toBe(true);
    });

    it('calls onPageChange with correct page numbers when navigation buttons are clicked', () => {
      // Arrange
      const handlePageChange = vi.fn();
      render(<Pagination currentPage={5} totalPages={10} onPageChange={handlePageChange} />);

      const firstBtn = screen.getByLabelText(/go to first page/i);
      const prevBtn = screen.getByLabelText(/go to previous page/i);
      const pageSixBtn = screen.getByLabelText(/page 6/i);
      const nextBtn = screen.getByLabelText(/go to next page/i);
      const lastBtn = screen.getByLabelText(/go to last page/i);

      // Act & Assert
      fireEvent.click(firstBtn);
      expect(handlePageChange).toHaveBeenCalledWith(1);

      fireEvent.click(prevBtn);
      expect(handlePageChange).toHaveBeenCalledWith(4);

      fireEvent.click(pageSixBtn);
      expect(handlePageChange).toHaveBeenCalledWith(6);

      fireEvent.click(nextBtn);
      expect(handlePageChange).toHaveBeenCalledWith(6);

      fireEvent.click(lastBtn);
      expect(handlePageChange).toHaveBeenCalledWith(10);

      expect(handlePageChange).toHaveBeenCalledTimes(5);
    });
  });
});

import React, { useMemo } from 'react';
import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from 'lucide-react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

export type PaginationItem = number | 'ellipsis';

export const getPaginationRange = (
  currentPage: number,
  totalPages: number,
  siblingCount: number = 1
): PaginationItem[] => {
  if (totalPages <= 1) return [];

  const totalPageNumbers = siblingCount * 2 + 5;

  if (totalPages <= totalPageNumbers) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

  const shouldShowLeftDots = leftSiblingIndex > 2;
  const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

  const firstPageIndex = 1;
  const lastPageIndex = totalPages;

  if (!shouldShowLeftDots && shouldShowRightDots) {
    const leftItemCount = 3 + 2 * siblingCount;
    const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
    return [...leftRange, 'ellipsis', totalPages];
  }

  if (shouldShowLeftDots && !shouldShowRightDots) {
    const rightItemCount = 3 + 2 * siblingCount;
    const rightRange = Array.from(
      { length: rightItemCount },
      (_, i) => totalPages - rightItemCount + i + 1
    );
    return [firstPageIndex, 'ellipsis', ...rightRange];
  }

  if (shouldShowLeftDots && shouldShowRightDots) {
    const middleRange = Array.from(
      { length: rightSiblingIndex - leftSiblingIndex + 1 },
      (_, i) => leftSiblingIndex + i
    );
    return [firstPageIndex, 'ellipsis', ...middleRange, 'ellipsis', lastPageIndex];
  }

  return [];
};

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  disabled = false,
}) => {
  const paginationRange = useMemo(
    () => getPaginationRange(currentPage, totalPages),
    [currentPage, totalPages]
  );

  if (totalPages <= 1 || paginationRange.length === 0) {
    return null;
  }

  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= totalPages;

  return (
    <nav
      role="navigation"
      aria-label="Pagination Navigation"
      className="flex items-center justify-center gap-1.5 sm:gap-2 select-none py-3"
    >
      {/* First Page Button (<<) */}
      <button
        type="button"
        onClick={() => onPageChange(1)}
        disabled={isFirstPage || disabled}
        aria-label="Go to first page"
        className="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer shadow-xs"
      >
        <ChevronsLeft size={16} />
      </button>

      {/* Previous Page Button (<) */}
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={isFirstPage || disabled}
        aria-label="Go to previous page"
        className="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer shadow-xs"
      >
        <ChevronLeft size={16} />
      </button>

      <div className="flex items-center gap-1 sm:gap-1.5">
        {paginationRange.map((pageNumber, idx) => {
          if (pageNumber === 'ellipsis') {
            const ellipsisKey = idx < paginationRange.length / 2 ? 'ellipsis-start' : 'ellipsis-end';
            return (
              <span
                key={ellipsisKey}
                className="w-8 h-8 flex items-center justify-center text-xs font-black text-slate-400 tracking-widest"
              >
                ...
              </span>
            );
          }

          const isActive = pageNumber === currentPage;

          return (
            <button
              key={`page-${pageNumber}`}
              type="button"
              onClick={() => onPageChange(pageNumber)}
              disabled={disabled}
              aria-current={isActive ? 'page' : undefined}
              aria-label={`Page ${pageNumber}`}
              className={`w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center shadow-xs ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-indigo-600/25 border border-indigo-600 scale-105'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-950 dark:hover:text-white'
              }`}
            >
              {pageNumber}
            </button>
          );
        })}
      </div>

      {/* Next Page Button (>) */}
      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={isLastPage || disabled}
        aria-label="Go to next page"
        className="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer shadow-xs"
      >
        <ChevronRight size={16} />
      </button>

      {/* Last Page Button (>>) */}
      <button
        type="button"
        onClick={() => onPageChange(totalPages)}
        disabled={isLastPage || disabled}
        aria-label="Go to last page"
        className="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer shadow-xs"
      >
        <ChevronsRight size={16} />
      </button>
    </nav>
  );
};

export default Pagination;

"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /** Max page buttons to show (default: 5) */
  windowSize?: number;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  windowSize = 5,
}: PaginationProps) {
  const canPrev = currentPage > 1;
  const canNext = currentPage < totalPages;

  const start = Math.max(
    1,
    Math.min(
      currentPage - Math.floor(windowSize / 2),
      totalPages - windowSize + 1,
    ),
  );
  const end = Math.min(start + windowSize - 1, totalPages);
  const pages: number[] = [];
  for (let i = start; i <= end; i++) pages.push(i);

  const btnBase =
    "inline-flex h-9 min-w-[2.25rem] items-center justify-center rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-40";

  return (
    <div className="mt-10 flex flex-wrap items-center justify-center gap-1.5">
      {/* Prev */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!canPrev}
        aria-label="Trang trước"
        className={`${btnBase} gap-1 border border-gray-200 bg-white px-3 text-gray-600 hover:bg-gray-50 hover:text-blue-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800`}
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Trước</span>
      </button>

      {/* Ellipsis start */}
      {start > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className={`${btnBase} border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-blue-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400`}
          >
            1
          </button>
          {start > 2 && (
            <span className="px-1 text-gray-400 dark:text-gray-600">…</span>
          )}
        </>
      )}

      {/* Page buttons */}
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          aria-current={p === currentPage ? "page" : undefined}
          className={`${btnBase} ${
            p === currentPage
              ? "bg-[#1572D3] text-white shadow-md shadow-blue-500/30 hover:bg-blue-600"
              : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-blue-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800"
          }`}
        >
          {p}
        </button>
      ))}

      {/* Ellipsis end */}
      {end < totalPages && (
        <>
          {end < totalPages - 1 && (
            <span className="px-1 text-gray-400 dark:text-gray-600">…</span>
          )}
          <button
            onClick={() => onPageChange(totalPages)}
            className={`${btnBase} border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-blue-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400`}
          >
            {totalPages}
          </button>
        </>
      )}

      {/* Next */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!canNext}
        aria-label="Trang sau"
        className={`${btnBase} gap-1 border border-gray-200 bg-white px-3 text-gray-600 hover:bg-gray-50 hover:text-blue-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800`}
      >
        <span className="hidden sm:inline">Sau</span>
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

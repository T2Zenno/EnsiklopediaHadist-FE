import React, { useState } from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number; 
  showGoToPage?: boolean;
}

const range = (start: number, end: number) => {
  let length = end - start + 1;
  return Array.from({ length }, (_, idx) => idx + start);
};

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  showGoToPage = true,
}) => {
  const [inputPage, setInputPage] = useState('');

  const paginationRange = React.useMemo(() => {
    const totalPageNumbers = siblingCount + 5; 

    if (totalPageNumbers >= totalPages) {
      return range(1, totalPages);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

    const firstPageIndex = 1;
    const lastPageIndex = totalPages;
    
    const DOTS = '...';

    if (!shouldShowLeftDots && shouldShowRightDots) {
      let leftItemCount = 3 + 2 * siblingCount;
      let leftRange = range(1, leftItemCount);
      return [...leftRange, DOTS, totalPages];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      let rightItemCount = 3 + 2 * siblingCount;
      let rightRange = range(totalPages - rightItemCount + 1, totalPages);
      return [firstPageIndex, DOTS, ...rightRange];
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
      let middleRange = range(leftSiblingIndex, rightSiblingIndex);
      return [firstPageIndex, DOTS, ...middleRange, DOTS, lastPageIndex];
    }

    return [];
  }, [totalPages, currentPage, siblingCount]);

  if (currentPage === 0 || totalPages <= 1) {
    return null;
  }

  const onNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  const onPrevious = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleGoToPage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const page = parseInt(inputPage, 10);
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      onPageChange(page);
      setInputPage('');
    }
  };
  
  const baseButtonClasses = "min-w-[40px] px-3 h-10 flex items-center justify-center text-sm font-medium rounded-md transition-colors";
  const defaultButtonClasses = "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700";
  const activeButtonClasses = "bg-emerald-600 border border-emerald-600 text-white cursor-default";
  const disabledButtonClasses = "opacity-50 cursor-not-allowed";
  const dotsClasses = "px-3 h-10 flex items-center justify-center text-gray-500 dark:text-gray-400";

  return (
    <div>
      <nav aria-label="Pagination">
        <ul className="flex justify-center items-center gap-2 flex-wrap">
          <li>
            <button
              onClick={onPrevious}
              disabled={currentPage === 1}
              className={`${baseButtonClasses} ${defaultButtonClasses} ${currentPage === 1 ? disabledButtonClasses : ''}`}
              aria-label="Go to previous page"
            >
              Sebelumnya
            </button>
          </li>
          {paginationRange?.map((pageNumber, index) => {
            if (pageNumber === '...') {
              return <li key={`dots-${index}`} className={dotsClasses}>&#8230;</li>;
            }

            return (
              <li key={pageNumber}>
                <button
                  onClick={() => onPageChange(pageNumber as number)}
                  className={`${baseButtonClasses} ${currentPage === pageNumber ? activeButtonClasses : defaultButtonClasses}`}
                  aria-current={currentPage === pageNumber ? 'page' : undefined}
                  aria-label={`Go to page ${pageNumber}`}
                >
                  {pageNumber}
                </button>
              </li>
            );
          })}
          <li>
            <button
              onClick={onNext}
              disabled={currentPage === totalPages}
              className={`${baseButtonClasses} ${defaultButtonClasses} ${currentPage === totalPages ? disabledButtonClasses : ''}`}
              aria-label="Go to next page"
            >
              Berikutnya
            </button>
          </li>
        </ul>
      </nav>
      {showGoToPage && (
        <form onSubmit={handleGoToPage} className="flex justify-center items-center gap-2 mt-4">
            <input
              type="number"
              value={inputPage}
              onChange={(e) => setInputPage(e.target.value)}
              min="1"
              max={totalPages}
              placeholder="Halaman..."
              className="w-28 px-3 h-10 border border-gray-300 rounded-md text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:placeholder-gray-500"
              aria-label="Go to page number"
            />
            <button
              type="submit"
              className="px-5 h-10 flex items-center justify-center text-sm font-medium rounded-md transition-colors bg-emerald-600 text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 dark:focus:ring-offset-gray-900"
            >
              Pergi
            </button>
          </form>
      )}
    </div>
  );
};
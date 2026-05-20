import { useState, useMemo, useCallback, useEffect } from 'react';
import { ITEMS_PER_PAGE } from '../constants';

export function usePagination(items, dependencies = []) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentPageItems = useMemo(
    () => items.slice(startIndex, endIndex),
    [items, startIndex, endIndex]
  );

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, dependencies);

  const goToFirstPage = useCallback(() => setCurrentPage(1), []);
  const goToLastPage = useCallback(() => setCurrentPage(totalPages), [totalPages]);
  const goToNextPage = useCallback(() => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  }, [totalPages]);
  const goToPreviousPage = useCallback(() => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  }, []);

  return {
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    currentPageItems,
    goToFirstPage,
    goToLastPage,
    goToNextPage,
    goToPreviousPage,
    setCurrentPage
  };
}

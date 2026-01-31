import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Standard interface for paginated responses from the backend.
 */
interface PaginationResponse<T> {
  docs: T[];
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
}

/**
 * Custom hook to manage infinite scroll pagination.
 * @param fetchFunction - Async function that calls the API and returns PaginationResponse.
 * @param limit - Number of items to fetch per page.
 */
export const usePagination = <T>(
  fetchFunction: (page: number, limit: number) => Promise<PaginationResponse<T>>, 
  limit: number = 10
) => {
  const [data, setData] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);

  /**
   * Fetches the next page of data and appends it to the existing state.
   */
  const loadMore = useCallback(async () => {
    if (loading || !hasNextPage) return;

    setLoading(true);
    try {
      const response = await fetchFunction(page, limit);
      
      // Append new documents to the existing data array
      setData((prev) => [...prev, ...response.docs]);
      
      // Check if there are more pages available
      setHasNextPage(response.page < response.totalPages);
      setPage((prev) => prev + 1);
    } catch (error) {
      console.error("Pagination Error:", error);
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasNextPage, fetchFunction, limit]);

  // Initial data fetch on component mount
  useEffect(() => {
    loadMore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  /**
   * Intersection Observer ref to trigger loadMore when the last element enters the viewport.
   */
  const lastElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasNextPage) {
        loadMore();
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasNextPage, loadMore]);

  return { 
    data, 
    loading, 
    lastElementRef, 
    hasNextPage, 
    setData, 
    setPage, 
    setHasNextPage 
  };
};


import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Standard interface for paginated responses from the backend.
 * Synchronized with MERN backend's mongoose-paginate-v2 output.
 *
 */
interface PaginationResponse<T> {
  docs: T[];
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
}

/**
 * Custom hook to manage infinite scroll pagination logic.
 * Orchestrates data accumulation and observer triggering for various lists.
 *
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
   * loadMore
   * Fetches the next page of data and appends it to the existing state.
   * Prevents duplicate requests using the 'loading' flag.
   */
  const loadMore = useCallback(async () => {
    if (loading || !hasNextPage) return;

    setLoading(true);
    try {
      const response = await fetchFunction(page, limit);
      
      // Append new documents to the existing data array to create continuous scroll
      setData((prev) => [...prev, ...response.docs]);
      
      // Update pagination control state based on backend response
      setHasNextPage(response.page < response.totalPages);
      setPage((prev) => prev + 1);
    } catch (error) {
      console.error("Pagination Error:", error);
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasNextPage, fetchFunction, limit]);

  // Initial data fetch to populate the list on component mount
  useEffect(() => {
    loadMore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  /**
   * lastElementRef
   * A callback ref that attaches an IntersectionObserver to the last item in the list.
   * When this node becomes visible, 'loadMore' is automatically triggered.
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

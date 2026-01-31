import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Standard interface for paginated responses from the backend.
 * Synchronized with MERN backend's mongoose-paginate-v2 output.
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
  const loadMore = useCallback(async (isRefresh: boolean = false) => {
    // If it's a refresh, we bypass the loading/hasNextPage checks initially
    if (!isRefresh && (loading || !hasNextPage)) return;

    setLoading(true);
    try {
      // Use page 1 if refreshing, otherwise use current page state
      const targetPage = isRefresh ? 1 : page;
      const response = await fetchFunction(targetPage, limit);
      
      setData((prev) => (isRefresh ? response.docs : [...prev, ...response.docs]));
      
      setHasNextPage(response.page < response.totalPages);
      setPage(response.page + 1);
    } catch (error) {
      console.error("Pagination Error:", error);
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasNextPage, fetchFunction, limit]);

  /**
   * refresh
   * Resets the pagination state and fetches the first page.
   * Necessary for search actions or pull-to-refresh scenarios.
   */
  const refresh = useCallback(() => {
    loadMore(true);
  }, [loadMore]);

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
  const lastElementRef = useCallback((node: HTMLElement | null) => {
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
    setHasNextPage,
    refresh // Added to satisfy requirements and fix build errors
  };
};

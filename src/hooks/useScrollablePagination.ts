import { useEffect, useRef } from 'react';

/**
 * Options for the scrollable pagination hook.
 *
 */
interface ScrollablePaginationOptions {
  containerRef: React.RefObject<HTMLElement>; // The parent scrollable container
  loadMoreRef: React.RefObject<HTMLElement>;  // The target element (spinner/skeleton) at the bottom
  fetchNextPage: () => Promise<void>;        // The function to trigger data fetch
  hasMore: boolean;                          // Flag to stop observing if no more data exists
  isLoading: boolean;                        // Flag to prevent overlapping requests
  debounceMs?: number;                       // Delay to prevent rapid-fire API calls
}

/**
 * useScrollablePagination
 * A performance-optimized hook that uses Intersection Observer for infinite scrolling.
 * Ideal for Map-of-Pi modules like Notifications, Reviews, and Orders.
 *
 */
export const useScrollablePagination = ({
  containerRef,
  loadMoreRef,
  fetchNextPage,
  hasMore,
  isLoading,
  debounceMs = 1000,
}: ScrollablePaginationOptions) => {
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Safety Guard: Stop if no more data, already loading, or target ref is missing
    if (!hasMore || isLoading || !loadMoreRef.current) return;

    // Disconnect existing observer before re-initializing
    if (observer.current) {
      observer.current.disconnect();
    }

    // Initialize IntersectionObserver to track the 'loadMoreRef'
    observer.current = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        // Trigger fetch only when the target is fully visible and system is ready
        if (entry.isIntersecting && hasMore && !isLoading) {
          if (debounceTimer.current) clearTimeout(debounceTimer.current);
          
          debounceTimer.current = setTimeout(() => {
            fetchNextPage();
          }, debounceMs);
        }
      },
      {
        root: containerRef.current, // Limits observation to the container's viewport
        threshold: 1.0,           // Triggers when the target is 100% visible
      }
    );

    const currentRef = loadMoreRef.current;
    observer.current.observe(currentRef);

    // Lifecycle Cleanup: Ensure observers are disconnected on unmount
    return () => {
      if (observer.current && currentRef) {
        observer.current.unobserve(currentRef);
      }
    };
  }, [hasMore, isLoading, loadMoreRef.current, containerRef.current]);
};

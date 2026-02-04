import { useEffect, useRef } from 'react';

interface ScrollablePaginationOptions {
  containerRef: React.RefObject<HTMLElement | null>;
  loadMoreRef: React.RefObject<HTMLElement | null>;
  fetchNextPage: () => Promise<void>;
  hasMore: boolean;
  isLoading: boolean;
  debounceMs?: number;
}

/**
 * Enhanced Intersection Observer Hook for Infinite Scrolling.
 * Optimizes performance by preventing unstable observer re-initializations.
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
    // Check for necessary conditions and valid DOM nodes
    const target = loadMoreRef.current;
    const root = containerRef.current;

    if (!hasMore || isLoading || !target) return;

    // Disconnect existing observer to maintain a singleton instance per state change
    if (observer.current) {
      observer.current.disconnect();
    }

    /**
     * Initialize Observer with the specified threshold.
     * Note: Depending on stable Ref objects ensures the effect doesn't 
     * re-run erratically on every render cycle.
     */
    observer.current = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && hasMore && !isLoading) {
          // Implementing debounce to prevent duplicate API calls on fast scrolling
          if (debounceTimer.current) clearTimeout(debounceTimer.current);
          debounceTimer.current = setTimeout(() => {
            fetchNextPage();
          }, debounceMs);
        }
      },
      {
        root: root, // Use the root container from the ref
        threshold: 1.0,
      }
    );

    observer.current.observe(target);

    // Cleanup phase: safely unobserve and clear timers
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
    /**
     * Dependency Array Strategy:
     * We depend on state values and the stable Ref objects. 
     * Removing '.current' properties from dependencies aligns with React best practices 
     * and fixes observer instability.
     */
  }, [hasMore, isLoading, loadMoreRef, containerRef, fetchNextPage, debounceMs]);
};

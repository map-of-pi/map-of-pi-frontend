import { useEffect, useRef } from 'react';

interface ScrollablePaginationOptions {
  containerRef: React.RefObject<HTMLElement>;
  loadMoreRef: React.RefObject<HTMLElement>;
  fetchNextPage: () => Promise<void>;
  hasMore: boolean;
  isLoading: boolean;
  debounceMs?: number;
}

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
    if (!hasMore || isLoading || !loadMoreRef.current) return;

    if (observer.current) {
      observer.current.disconnect();
    }

    observer.current = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && hasMore && !isLoading) {
          if (debounceTimer.current) clearTimeout(debounceTimer.current);
          debounceTimer.current = setTimeout(() => {
            fetchNextPage();
          }, debounceMs);
        }
      },
      {
        root: containerRef.current,
        threshold: 1.0,
      }
    );

    const currentRef = loadMoreRef.current;
    observer.current.observe(currentRef);

    return () => {
      if (observer.current && currentRef) {
        observer.current.unobserve(currentRef);
      }
    };
  }, [hasMore, isLoading, loadMoreRef.current, containerRef.current]);
};

import { useState, useEffect, useRef, useCallback } from 'react';
import { resolveRating } from '@/app/[locale]/seller/reviews/util/ratingUtils';
import { IReviewOutput, ReviewInt } from '@/constants/types';
import { resolveDate } from '@/utils/date';
import logger from "../../logger.config.mjs"
import { toast } from 'react-toastify';

export type ReviewType = 'given' | 'received';

export function processReviews(data: IReviewOutput[], locale: string): ReviewInt[] {
  return data
    .map((feedback) => {
      const { date, time } = resolveDate(feedback.review_date, locale);
      const { reaction, unicode } = resolveRating(feedback.rating) || {};
      return {
        heading: feedback.comment,
        date,
        time,
        giver: feedback.giver,
        receiver: feedback.receiver,
        giverId: feedback.review_giver_id,
        receiverId: feedback.review_receiver_id,
        reviewId: feedback._id,
        reaction,
        unicode,
        image: feedback.image,
      };
    })
    .filter((r): r is ReviewInt => r !== null);
}

interface CursorResponse<T> {
  data: T[];
  nextCursor?: string;
}

interface UseCursorInfiniteScrollProps<TRaw, TProcessed = TRaw> {
  fetchPage: (
    cursor?: string,
    signal?: AbortSignal
  ) => Promise<CursorResponse<TRaw>>;
  process?: (data: TRaw[]) => TProcessed[];
  dependencies?: any[];
  debounceMs?: number;
}

export function useCursorInfiniteScroll<TRaw, TProcessed = TRaw>({
  fetchPage,
  process,
  dependencies = [],
  debounceMs = 300,
}: UseCursorInfiniteScrollProps<TRaw, TProcessed>) {
  const [items, setItems] = useState<TProcessed[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const requestIdRef = useRef(0); // prevents stale updates

  // ───────────────────────────────
  // Reset
  // ───────────────────────────────
  const reset = useCallback(() => {
    abortRef.current?.abort();
    setItems([]);
    setCursor(null);
    setHasMore(true);
    setInitialLoading(true);
  }, []);

  // ───────────────────────────────
  // Core Loader
  // ───────────────────────────────
  const loadPage = useCallback(
    async (nextCursor?: string | null) => {
      if (loading) return;
      if (!hasMore && nextCursor) return;

      // Cancel previous request
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const currentRequestId = ++requestIdRef.current;

      setLoading(true);

      try {
        const response = await fetchPage(
          nextCursor ?? undefined,
          controller.signal
        );

        // Ignore if stale
        if (currentRequestId !== requestIdRef.current) return;

        const processed: TProcessed[] = process
          ? process(response.data)
          : (response.data as unknown as TProcessed[]);

        setItems((prev) => {
          const existingIds = new Set(
            (prev as any[]).map((item) => item.reviewId ?? item.id)
          );

          const filtered = (processed as any[]).filter(
            (item) => !existingIds.has(item.reviewId ?? item.id)
          );

          return [...prev, ...filtered] as TProcessed[];
        });

        setCursor(response.nextCursor ?? null);
        setHasMore(!!response.nextCursor);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          logger.error('Infinite scroll error:', err);
          toast.error('Failed to load reviews.');
          setHasMore(false);
        }
      } finally {
        if (currentRequestId === requestIdRef.current) {
          setLoading(false);
          setInitialLoading(false);
        }
      }
    },
    [fetchPage, process, hasMore, loading]
  );

  // ───────────────────────────────
  // Debounced Loader
  // ───────────────────────────────
  const debouncedLoad = useCallback(
    (nextCursor?: string | null) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        loadPage(nextCursor);
      }, debounceMs);
    },
    [loadPage, debounceMs]
  );

  // ───────────────────────────────
  // Initial load on dependency change
  // ───────────────────────────────
  useEffect(() => {
    reset();
    loadPage(null);

    return () => {
      abortRef.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  // ───────────────────────────────
  // IntersectionObserver
  // ───────────────────────────────
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          debouncedLoad(cursor);
        }
      },
      {
        root: null,
        rootMargin: '300px',
        threshold: 0,
      }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [cursor, hasMore, debouncedLoad]);

  // ───────────────────────────────
  // Scroll fallback (robust)
  // ───────────────────────────────
  useEffect(() => {
    const handleScroll = () => {
      const node = sentinelRef.current;
      if (!node || loading || !hasMore) return;

      const rect = node.getBoundingClientRect();
      if (rect.top <= window.innerHeight + 300) {
        debouncedLoad(cursor);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [cursor, hasMore, loading, debouncedLoad]);

  return {
    items,
    loading,
    initialLoading,
    hasMore,
    reset,
    sentinelRef,
  };
}
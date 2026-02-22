import { useState, useEffect, useRef, useCallback } from 'react';
import { resolveRating } from '@/app/[locale]/seller/reviews/util/ratingUtils';
import { IReviewOutput, ReviewInt } from '@/constants/types';
import { fetchReviews } from '@/services/reviewsApi';
import { resolveDate } from '@/utils/date';
import logger from "../../logger.config.mjs"

export type ReviewType = 'given' | 'received';

const LOAD_MORE_DEBOUNCE_MS = 500;

interface UseInfiniteReviewsOptions {
  userId: string;
  type: ReviewType;
  locale: string;
}

interface UseInfiniteReviewsReturn {
  reviews: ReviewInt[];
  hasMore: boolean;
  isLoadingMore: boolean;
  loaderRef: React.RefObject<HTMLDivElement>;
  reset: (reviews: ReviewInt[], searchQuery: string | undefined, cursor?: string) => void;
}

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

export function useInfiniteReviews({
  userId,
  type,
  locale,
}: UseInfiniteReviewsOptions): UseInfiniteReviewsReturn {
  const [reviews, setReviews] = useState<ReviewInt[]>([]);
  const [searchQuery, setSearchQuery] = useState<string | undefined>(undefined);
  const [cursor, setCursor] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // searchQuery included so loadMore always reads the fresh value without
  // needing it in the useCallback dep array (which would recreate the fn)
  const stateRef = useRef({ hasMore, isLoadingMore, cursor, searchQuery });
  useEffect(() => {
    stateRef.current = { hasMore, isLoadingMore, cursor, searchQuery };
  }, [hasMore, isLoadingMore, cursor, searchQuery]);

  const loadMore = useCallback(() => {
    // Debounce: cancel any pending call before scheduling a new one.
    // Prevents duplicate fetches when the IntersectionObserver fires
    // multiple times in quick succession (e.g. during fast scrolling).
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    debounceTimerRef.current = setTimeout(async () => {
      const { hasMore, isLoadingMore, cursor, searchQuery } = stateRef.current;
      if (!hasMore || isLoadingMore) return;

      setIsLoadingMore(true);
      try {
        const data = await fetchReviews(userId, searchQuery, cursor, type);
        const incoming = data?.reviews ?? [];

        if (incoming.length > 0) {
          setReviews((prev) => [...prev, ...processReviews(incoming, locale)]);
          setCursor(data.nextCursor);
          setHasMore(!!data.nextCursor);
        } else {
          setHasMore(false);
        }
      } catch (err) {
        logger.error(`[useInfiniteReviews] loadMore failed (${type}):`, err);
        // Don't rethrow — leave hasMore true so scrolling can retry
      } finally {
        setIsLoadingMore(false);
      }
    }, LOAD_MORE_DEBOUNCE_MS);
  }, [userId, type, locale]);

  // Cleanup pending debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const el = loaderRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMore(); },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [cursor, hasMore, loadMore]);

  const reset = useCallback((
    incoming: ReviewInt[],
    searchQuery: string | undefined,
    nextCursor?: string
  ) => {
    setReviews(incoming);
    setSearchQuery(searchQuery); // undefined clears search context (used on refresh)
    setCursor(nextCursor);
    setHasMore(!!nextCursor);
  }, []);

  return { reviews, hasMore, isLoadingMore, loaderRef, reset };
}
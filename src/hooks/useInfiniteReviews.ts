import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocale } from 'next-intl';
import { resolveRating } from '@/app/[locale]/seller/reviews/util/ratingUtils';
import { IReviewOutput, ReviewInt } from '@/constants/types';
import { fetchReviews } from '@/services/reviewsApi';
import { resolveDate } from '@/utils/date';

export type ReviewType = 'given' | 'received';

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
  reset: (reviews: ReviewInt[], cursor?: string) => void;
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
  const [cursor, setCursor] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  // Mirror state into a ref so the IntersectionObserver never closes over stale values
  const stateRef = useRef({ hasMore, isLoadingMore, cursor });
  useEffect(() => {
    stateRef.current = { hasMore, isLoadingMore, cursor };
  }, [hasMore, isLoadingMore, cursor]);

  const loadMore = useCallback(async () => {
    const { hasMore, isLoadingMore, cursor } = stateRef.current;
    if (!hasMore || isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      const data = await fetchReviews(userId, undefined, cursor, type);
      const incoming = data?.reviews ?? [];

      if (incoming.length > 0) {
        setReviews((prev) => [...prev, ...processReviews(incoming, locale)]);
        setCursor(data.nextCursor);
        setHasMore(!!data.nextCursor);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      // logger.error(`[useInfiniteReviews] Failed to load more (${type}):`, err);
      // Don't rethrow — leave hasMore true so scrolling can retry
    } finally {
      setIsLoadingMore(false);
    }
  }, [userId, type, locale]);

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

  const reset = useCallback((incoming: ReviewInt[], nextCursor?: string) => {
    setReviews(incoming);
    setCursor(nextCursor);
    setHasMore(!!nextCursor);
  }, []);

  return { reviews, hasMore, isLoadingMore, loaderRef, reset };
}

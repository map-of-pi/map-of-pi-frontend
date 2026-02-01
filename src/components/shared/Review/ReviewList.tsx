'use client';

import React, { useRef } from 'react';
import { useTranslations } from 'next-intl';
import { usePagination } from '@/hooks/usePagination';
// FIX: Corrected import path and function name to match reviewsApi.ts
import { fetchReviews } from '@/services/reviewsApi'; 
/**
 * FIX: Updated import path to match the new unique filename 'MainSkeleton'.
 * This resolves the Type error: "Cannot find module '../../skeleton/skeleton'"
 * and ensures the production build completes successfully.
 */
import Skeleton from '../../skeleton/MainSkeleton'; 
// Importing existing components to ensure no logic is broken
import TrustMeter from './TrustMeter'; 
import EmojiPicker from './emojipicker'; 

interface ReviewListProps {
  sellerId: string;
}

/**
 * ReviewList Component
 * Optimized for Map-of-Pi to handle high-volume feedback without performance degradation.
 * Maintains full compatibility with the MERN backend pagination logic.
 */
export const ReviewList: React.FC<ReviewListProps> = ({ sellerId }) => {
  const t = useTranslations();

  /**
   * Safe integration of usePagination hook.
   * Synchronized with our unified hook logic (fetchFunction, limit).
   * Re-mapping 'hasNextPage' to 'hasMore' for backward compatibility.
   */
  const {
    data: reviews,
    loading,
    hasNextPage: hasMore,
    lastElementRef
  } = usePagination<any>(
    (page, limit) => fetchReviews(sellerId, '', page, limit),
    5
  );

  return (
    <div className="review-list-container w-full">
      {/* List Header */}
      <h3 className="text-lg font-bold mb-6">{t('REVIEWS.TITLE')}</h3>
      
      <div className="flex flex-col gap-6">
        {reviews.map((review: any, index: number) => {
          const isLast = index === reviews.length - 1;
          return (
            <div 
              key={review._id} 
              // FIX: Attach lastElementRef to the last item for infinite scroll
              ref={isLast ? (lastElementRef as any) : null}
              className="border-b border-gray-100 pb-6 transition-all"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex flex-col">
                  <span className="font-bold text-gray-800">{review.pioneer_name || review.giver}</span>
                  <span className="text-xs text-gray-400">
                    {new Date(review.createdAt || review.review_date).toLocaleDateString()}
                  </span>
                </div>
                {/* FIX: Changed 'rating' to 'ratings' to match TrustMeter's expected prop name */}
                <TrustMeter ratings={review.rating} />
              </div>

              <p className="text-gray-600 text-sm leading-relaxed mb-3">
                {review.comment}
              </p>

              {review.hasEmoji && <EmojiPicker initialData={review.emojis} readOnly={true} />}
            </div>
          );
        })}
      </div>

      {/* Pagination & Loading Visuals using MainSkeleton */}
      <div className="py-8">
        {loading && (
          <div className="flex flex-col gap-4">
            <Skeleton type="seller_review" />
          </div>
        )}

        {!hasMore && reviews.length > 0 && (
          <p className="text-center text-sm text-gray-400 font-medium py-4">
            {t('REVIEWS.END_OF_LIST')}
          </p>
        )}

        {!loading && reviews.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <p className="text-gray-500">{t('REVIEWS.NO_DATA')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewList;

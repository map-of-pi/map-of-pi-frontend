'use client';

import React, { useRef } from 'react';
import { useTranslations } from 'next-intl';
import { usePagination } from '@/hooks/usePagination';
import { fetchReviewsApi } from '@/services/reviewApi'; 
import Skeleton from '../../skeleton/Skeleton';
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
  const observerTarget = useRef<HTMLDivElement>(null);

  // Integrating with the existing usePagination hook for seamless data flow
  const {
    data: reviews,
    loading,
    hasMore,
  } = usePagination({
    fetchData: (page) => fetchReviewsApi(sellerId, page),
    dependency: sellerId,
    observerTarget,
  });

  return (
    <div className="review-list-container w-full">
      {/* List Header */}
      <h3 className="text-lg font-bold mb-6">{t('REVIEWS.TITLE')}</h3>
      
      <div className="flex flex-col gap-6">
        {reviews.map((review: any) => (
          <div key={review._id} className="border-b border-gray-100 pb-6 transition-all">
            <div className="flex justify-between items-start mb-3">
              <div className="flex flex-col">
                <span className="font-bold text-gray-800">{review.pioneer_name}</span>
                <span className="text-xs text-gray-400">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
              {/* Using existing TrustMeter component to maintain UI consistency */}
              <TrustMeter rating={review.rating} />
            </div>

            <p className="text-gray-600 text-sm leading-relaxed mb-3">
              {review.comment}
            </p>

            {/* Support for potential emoji reactions if enabled in the backend */}
            {review.hasEmoji && <EmojiPicker initialData={review.emojis} readOnly={true} />}
          </div>
        ))}
      </div>

      {/* Pagination & Loading Visuals */}
      <div ref={observerTarget} className="py-8">
        {loading && (
          <div className="flex flex-col gap-4">
            {/* Calling the seller_review type we recently added to the Skeleton dispatcher */}
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

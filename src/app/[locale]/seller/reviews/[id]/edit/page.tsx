'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useEffect, useState, useContext } from 'react';
import EmojiPicker from '@/components/shared/Review/emojipicker';
import Skeleton from '@/components/skeleton/skeleton';
import { IReviewOutput } from '@/constants/types';
import { fetchSingleReview } from '@/services/reviewsApi';
import { checkAndAutoLoginUser } from '@/utils/auth';
import { resolveDate } from '@/utils/date';
import { AppContext } from '../../../../../../../context/AppContextProvider';
import logger from '../../../../../../../logger.config.mjs';

/**
 * EditReviewPage Component
 * Provides a dedicated interface for Pioneers to modify their existing reviews.
 * Optimized with defensive coding to ensure data integrity during fetch operations.
 */
export default function EditReviewPage({ params }: { params: { id: string } }) {
  const t = useTranslations();
  const locale = useLocale();
  
  const reviewId = params.id;

  const [originalReview, setOriginalReview] = useState<IReviewOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser, reload, setReload, authenticateUser } = useContext(AppContext);

  // States for editable fields (maintained for consistency with existing architecture)
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [image, setImage] = useState<string | null>(null);

  const [isSaveEnabled, setIsSaveEnabled] = useState(false);

  /**
   * Effect hook to synchronize authentication and fetch review details.
   * Utilizes the enhanced review API service to handle potential data inconsistencies.
   */
  useEffect(() => {
    checkAndAutoLoginUser(currentUser, authenticateUser);

    const getReviewData = async () => {
      if (!reviewId) return;

      try {
        logger.info(`Fetching review data for editing. ID: ${reviewId}`);
        setLoading(true);
        const data = await fetchSingleReview(reviewId);

        // Validating data response structure to prevent UI hydration errors
        if (data && data.review) {
          setOriginalReview(data.review);
          setRating(data.review.rating);
          setComment(data.review.comment || '');
          setImage(data.review.image || null);
          setError(null);
        } else {
          logger.warn(`Review not found for ID: ${reviewId}`);
          setError('Review not found');
        }
      } catch (error) {
        logger.error('Critical error fetching review data for modification:', error);
        setError(t('SCREEN.REPLY_TO_REVIEW.VALIDATION.LOADING_REVIEW_FAILURE') || 'Error loading review.');
      } finally {
        setLoading(false);
        setReload(false); // Reset context reload flag to prevent infinite loops
      }
    };

    getReviewData();
  }, [reviewId, currentUser, reload, t, setReload]);

  /**
   * Loading State
   * Aligned with global UX patterns using the standardized skeleton loader.
   */
  if (loading) {
    logger.info('Rendering EditReviewPage loading skeleton...');
    return <Skeleton type="seller_review" />;
  }

  return (
    <div className="w-full md:w-[500px] md:mx-auto p-4">
      <h1 className="mb-5 font-bold text-lg md:text-2xl">
        {t('SCREEN.EDIT_REVIEW.EDIT_REVIEW_HEADER')}
      </h1>
      
      {/* Error Boundary Messaging */}
      {error && (
        <div className="text-red-700 text-center text-lg py-10">
          {t('SCREEN.REPLY_TO_REVIEW.VALIDATION.LOADING_REVIEW_FAILURE')}
        </div>
      )}

      {/* Render Edit Form only when original review data is successfully resolved */}
      {originalReview && (
        <div className="mt-2 animate-fadeIn">
          {(() => {
            const { date, time } = resolveDate(originalReview.review_date, locale);
            return (
              <>
                {/* Read-only Meta Information Section */}
                <div className="mb-4 flex flex-col gap-3">
                  <div className="review-meta-item">
                    <label className="block text-black mb-1 font-medium">
                      {t('SCREEN.EDIT_REVIEW.REVIEW_GIVEN_TO_LABEL') + ': '}
                    </label>
                    <div className="border border-gray-200 rounded p-2 bg-gray-50 text-green-700 font-semibold">
                      {originalReview.receiver || t('SHARED.UNKNOWN_USER')}
                    </div>
                  </div>
                  <div className="review-meta-item">
                    <label className="block text-black mb-1 font-medium">
                      {t('SCREEN.EDIT_REVIEW.DATE_TIME_REVIEW_GIVEN_LABEL') + ': '}
                    </label>
                    <div className="border border-gray-200 rounded p-2 bg-gray-50 text-gray-700">
                      {date}, {time}
                    </div>
                  </div>
                </div>

                {/* Editable Section: Emoji and Comment Picker */}
                <div className="mb-4 mt-6">
                  <EmojiPicker
                    currentUser={currentUser}
                    replyToReviewId={reviewId}
                    userId={originalReview.review_receiver_id}
                    initialRating={rating}
                    initialComment={comment}
                    initialImage={image}
                    isEditMode={true}
                    reviewId={reviewId}
                    setIsSaveEnabled={setIsSaveEnabled}
                  />
                </div>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}

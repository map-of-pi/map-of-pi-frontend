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

export default function EditReviewPage({ params }: { params: { id: string } }) {
  const t = useTranslations();
  const locale = useLocale();
  
  const reviewId = params.id;

  const [originalReview, setOriginalReview] = useState<IReviewOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser, reload, setReload, autoLoginUser } = useContext(AppContext);

  // Editable fields
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [image, setImage] = useState<string | null>(null);

  const [isSaveEnabled, setIsSaveEnabled] = useState(false);

  useEffect(() => {
    checkAndAutoLoginUser(currentUser, autoLoginUser);

    const getReviewData = async () => {
      try {
        logger.info(`Fetching review data for editing: ${reviewId}`);
        setLoading(true);
        const data = await fetchSingleReview(reviewId);

        if (data.review) {
          setOriginalReview(data.review);
          setRating(data.review.rating);
          setComment(data.review.comment || '');
          setImage(data.review.image || null);
        } else {
          setError('Review not found');
        }
      } catch (error) {
        logger.error('Error fetching review data for edit', error);
        setError('Error loading review. Please try again later.');
      } finally {
        setLoading(false);
        setReload(false); // reset reload flag
      }
    };

    getReviewData();
  }, [reviewId, currentUser, reload]);

  if (loading) {
    logger.info('Loading seller reviews edit..');
    return <Skeleton type="seller_review" />;
  }

  return (
    <div className="w-full md:w-[500px] md:mx-auto p-4">
      <h1 className="mb-5 font-bold text-lg md:text-2xl">
        {t('SCREEN.EDIT_REVIEW.EDIT_REVIEW_HEADER')}
      </h1>
      {error && (
        <div className="text-red-700 text-center text-lg">
          {t('SCREEN.REPLY_TO_REVIEW.VALIDATION.LOADING_REVIEW_FAILURE')}
        </div>
      )}

      {originalReview && (
        <div className="mt-2">
          {(() => {
            const { date, time } = resolveDate(originalReview.review_date, locale);
            return (
              <>
                {/* Read-only fields */}
                <div className="mb-4 flex flex-col gap-3">
                  <div>
                    <label className="block text-black mb-1">
                      {t('SCREEN.EDIT_REVIEW.REVIEW_GIVEN_TO_LABEL') + ': '}
                    </label>
                    <div className="border rounded p-2 bg-gray-100 text-green-600">
                      {originalReview.receiver}
                    </div>
                  </div>
                  <div>
                    <label className="block text-black mb-1">
                      {t('SCREEN.EDIT_REVIEW.DATE_TIME_REVIEW_GIVEN_LABEL') + ': '}
                    </label>
                    <div className="border rounded p-2 bg-gray-100 text-green-600">
                      {date}, {time}
                    </div>
                  </div>
                </div>

                {/* Editable: rating */}
                <div className="mb-4">
                  <EmojiPicker
                    currentUser={currentUser}
                    replyToReviewId={reviewId}
                    userId={originalReview.review_receiver_id}
                    initialRating={rating}
                    initialComment={originalReview.comment || ''}
                    initialImage={originalReview.image || null}
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
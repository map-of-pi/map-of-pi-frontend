'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState, useContext } from 'react';
import { toast } from 'react-toastify';
import EmojiPicker from '@/components/shared/Review/emojipicker';
import Skeleton from '@/components/skeleton/skeleton';
import { IReviewOutput } from '@/constants/types';
import { fetchSingleReview, updateReview } from '@/services/reviewsApi';
import { checkAndAutoLoginUser } from '@/utils/auth';
import { resolveDate } from '@/utils/date';
import { AppContext } from '../../../../../../../context/AppContextProvider';
import logger from '../../../../../../../logger.config.mjs';

export default function EditReviewPage({ params }: { params: { id: string } }) {
  const t = useTranslations();
  const reviewId = params.id;

  const { currentUser, autoLoginUser } = useContext(AppContext);
  const [originalReview, setOriginalReview] = useState<IReviewOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Editable fields
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [image, setImage] = useState<string | null>(null);

  const [isSaveEnabled, setIsSaveEnabled] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    checkAndAutoLoginUser(currentUser, autoLoginUser);

    const getReviewData = async () => {
      try {
        logger.info(`Fetching review data for editing: ${reviewId}`);
        const data = await fetchSingleReview(reviewId);

        if (data.review) {
          setOriginalReview(data.review);
          const { rating, comment, image } = data.review;
          setRating(rating);
          setComment(comment || '');
          setImage(image || null);
        } else {
          setError('Review not found');
        }
      } catch (error) {
        logger.error('Error fetching review data for edit', error);
        setError('Error loading review. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    getReviewData();
  }, [reviewId, currentUser]);

  // Detect changes
  useEffect(() => {
    if (!originalReview) return;

    const hasChanges =
      rating !== originalReview.rating ||
      comment !== (originalReview.comment || '') ||
      image !== (originalReview.image || null);

    setIsSaveEnabled(hasChanges);
  }, [rating, comment, image, originalReview]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!originalReview) return;

    setSaving(true);
    try {
      await updateReview(reviewId, {
        rating,
        comment,
        image,
      });
      toast.success(t('SCREEN.REVIEWS.EDIT.SAVE_SUCCESS'));
      setOriginalReview({
        ...originalReview,
        rating: rating!,
        comment,
        image: image || '',
      });
      setIsSaveEnabled(false);
    } catch (err) {
      logger.error('Error updating review', err);
      toast.error(t('SCREEN.REVIEWS.EDIT.SAVE_ERROR'));
    } finally {
      setSaving(false);
    }
  };

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
            const { date, time } = resolveDate(originalReview.review_date);
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

'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useContext } from 'react';
import { toast } from 'react-toastify';
import { IReviewOutput } from '@/constants/types';
import { fetchSingleReview, updateReview } from '@/services/reviewsApi';
import { checkAndAutoLoginUser } from '@/utils/auth';
import { resolveDate } from '@/utils/date';
import { AppContext } from '../../../../../../../context/AppContextProvider';
import logger from '../../../../../../../logger.config.mjs';
import EmojiPicker from '@/components/shared/Review/emojipicker';
import Skeleton from '@/components/skeleton/skeleton';

export default function EditReviewPage({ params }: { params: { id: string } }) {
  const t = useTranslations();
  const router = useRouter();
  const reviewId = params.id;

  const { currentUser, autoLoginUser } = useContext(AppContext);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [originalReview, setOriginalReview] = useState<IReviewOutput | null>(null);

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
      } catch (err) {
        logger.error(`Error fetching review data for edit`, err);
        setError('Error loading review');
      } finally {
        setLoading(false);
      }
    };

    getReviewData();
  }, [reviewId]);

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
    return <Skeleton type="seller_review" />;
  }

  if (error) {
    return <div className="text-center text-red-600">{error}</div>;
  }

  if (!originalReview) return null;

  const { date, time } = resolveDate(originalReview.review_date);

  return (
    <div className="w-full md:w-[500px] md:mx-auto p-4">
    <h1 className="mb-5 font-bold text-lg md:text-2xl">
       Edit Review
    </h1>

      {/* Read-only fields */}
<div className="mb-4 flex flex-col gap-3">
  <div>
    <label className="block text-black mb-1">
      Review given to:
    </label>
    <div className="border rounded p-2 bg-gray-100 text-green-600">
      {originalReview.receiver}
    </div>
  </div>

  <div>
      <label className="block text-black mb-1">
      Date and time Review given:
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
          userId={originalReview.receiverId}
          initialRating={rating}
          initialComment={originalReview.comment || ''}
          initialImage={originalReview.image || null}
         isEditMode={true}
        reviewId={reviewId}
        setIsSaveEnabled={setIsSaveEnabled}
        />
      </div>
    </div>
  );
}

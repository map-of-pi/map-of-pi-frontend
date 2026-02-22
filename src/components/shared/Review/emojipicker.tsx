"use client";

import { useTranslations } from 'next-intl';
import { useState, useEffect, useContext, useCallback } from 'react';
import { toast } from 'react-toastify';
import { createReview, updateReview } from '@/services/reviewsApi';
import removeUrls from '@/utils/sanitize';
import { FileInput, TextArea } from '../Forms/Inputs/Inputs';
import { AppContext } from '../../../../context/AppContextProvider';
import logger from '../../../../logger.config.mjs';
import { IUser } from '@/constants/types';

interface Emoji {
  name: string;
  unicode: string;
  code: string;
  value: number;
}

interface EmojiPickerProps {
  userId: string;
  currentUser: IUser | null;
  isEditMode?: boolean;
  reviewId?: string;
  replyToReviewId?: string;
  initialComment?: string;
  initialRating?: number;
  initialImage?: string;
  clickDisabled?: boolean;
  reviews?: Record<string, number>;
  setIsSaveEnabled?: (val: boolean) => void;
  refresh?: () => void;
}

export default function EmojiPicker({
  userId,
  currentUser,
  isEditMode,
  reviewId,
  replyToReviewId,
  initialComment = '',
  initialRating,
  initialImage = '',
  clickDisabled,
  reviews,
  setIsSaveEnabled: notifyParent,
  refresh,
}: EmojiPickerProps) {
  const t = useTranslations();
  const { setAlertMessage, isSaveLoading, setIsSaveLoading, setReload } = useContext(AppContext);

  const despairEmoji: Emoji = { name: t('SHARED.REACTION_RATING.EMOTIONS.DESPAIR'), unicode: "😠", code: ":despair:", value: 0 };
  const emojis: Emoji[] = [
    { name: t('SHARED.REACTION_RATING.EMOTIONS.SAD'),     unicode: "🙁", code: ":sad_face:",    value: 2 },
    { name: t('SHARED.REACTION_RATING.EMOTIONS.OKAY'),    unicode: "🙂", code: ":okay_face:",   value: 3 },
    { name: t('SHARED.REACTION_RATING.EMOTIONS.HAPPY'),   unicode: "😃", code: ":happy_face:",  value: 4 },
    { name: t('SHARED.REACTION_RATING.EMOTIONS.DELIGHT'), unicode: "😍", code: ":delight_face:", value: 5 },
  ];

  const [file, setFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState(initialImage);
  const [isSaveEnabled, setIsSaveEnabled] = useState(false);
  const [comments, setComments] = useState(initialComment);
  const [reviewEmoji, setReviewEmoji] = useState<number | null>(initialRating ?? null);
  const [selectedEmoji, setSelectedEmoji] = useState<number | null>(initialRating ?? null);

  // Sync controlled initial props (edit mode hydration)
  useEffect(() => {
    if (initialRating != null) {
      setReviewEmoji(initialRating);
      setSelectedEmoji(initialRating);
    }
  }, [initialRating]);

  useEffect(() => { setPreviewImage(initialImage); }, [initialImage]);
  useEffect(() => { setComments(initialComment); },  [initialComment]);

  // Object URL lifecycle — single creation, guaranteed revocation
  useEffect(() => {
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setPreviewImage(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  // Dirty-check to enable/disable save
  useEffect(() => {
    const hasChanges =
      comments !== initialComment ||
      reviewEmoji !== (initialRating ?? null) ||
      previewImage !== initialImage;

    setIsSaveEnabled(hasChanges);
    notifyParent?.(hasChanges);
  }, [comments, reviewEmoji, previewImage]);

  const resetReview = useCallback(() => {
    setSelectedEmoji(null);
    setReviewEmoji(null);
    setComments('');
    setPreviewImage('');
    setFile(null);
    setIsSaveEnabled(false);
    notifyParent?.(false);
  }, [notifyParent]);

  const buildFormData = (isEdit: boolean): FormData => {
    const formData = new FormData();
    formData.append('comment', removeUrls(comments));
    formData.append('rating', reviewEmoji!.toString());
    formData.append('image', file ?? '');
    if (!isEdit) {
      formData.append('review_receiver_id', userId);
      formData.append('reply_to_review_id', replyToReviewId ?? '');
    }
    return formData;
  };

  const validate = (): boolean => {
    if (!currentUser) {
      toast.error(t('SHARED.VALIDATION.SUBMISSION_FAILED_USER_NOT_AUTHENTICATED'));
      logger.warn('Unable to submit review; user not authenticated.');
      return false;
    }
    if (currentUser.pi_uid === userId) {
      toast.error(t('SCREEN.REPLY_TO_REVIEW.VALIDATION.SELF_REVIEW_NOT_POSSIBLE'));
      logger.warn(`Attempted self review by user ${currentUser.pi_uid}`);
      return false;
    }
    if (reviewEmoji === null) {
      toast.warn(t('SHARED.REACTION_RATING.VALIDATION.SELECT_EMOJI_EXPRESSION'));
      logger.warn('Attempted to save review without selecting an emoji.');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;
    try {
      setIsSaveEnabled(false);
      setIsSaveLoading(true);
      setAlertMessage(t('SHARED.SAVING_SCREEN_MESSAGE'));

      const formData = buildFormData(!!isEditMode);

      if (isEditMode && reviewId) {
        await updateReview(reviewId, formData);
        setReload(true);
      } else {
        await createReview(formData);
        refresh?.();
      }

      resetReview();
    } catch (error) {
      logger.error('Error saving review:', error);
    } finally {
      setIsSaveLoading(false);
      setAlertMessage(null);
    }
  };

  const handleEmojiClick = (value: number) => {
    if (isSaveLoading || clickDisabled) return;
    const next = selectedEmoji === value ? null : value;
    setSelectedEmoji(next);
    setReviewEmoji(next);
  };

  const handleAddImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isSaveLoading) return;
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected); // useEffect handles preview + cleanup
      logger.info('Image selected for upload:', { selected });
    }
  };

  const emojiBtnClass = 'rounded-md w-full outline outline-[0.5px] flex justify-center items-center cursor-pointer p-1';

  return (
    <div className="mb-3">
      <p>{t('SCREEN.REPLY_TO_REVIEW.FACE_SELECTION_REVIEW_MESSAGE')}</p>
      <div className='flex sm:overflow-hidden overflow-auto gap-3 w-full text-center justify-center my-2'>

        {/* Unsafe / despair */}
        <div className='bg-[#DF2C2C33] flex-grow-[0.5] rounded-md p-2'>
          <p className='text-red-700 mb-2'>{t('SHARED.REACTION_RATING.UNSAFE')}</p>
          <div
            onClick={() => handleEmojiClick(despairEmoji.value)}
            className={`${selectedEmoji !== despairEmoji.value ? 'bg-red-200' : 'bg-red-700'} outline-[#DF2C2C] ${emojiBtnClass}`}
          >
            <div>
              <p className='text-3xl md:py-2 py-1'>{despairEmoji.unicode}</p>
              <p className={`md:text-[16px] text-[14px] ${selectedEmoji === despairEmoji.value && 'text-white'}`}>
                {despairEmoji.name}
              </p>
              {reviews && <p>{reviews[despairEmoji.name]}</p>}
            </div>
          </div>
        </div>

        {/* Trustworthy emojis */}
        <div className='bg-[#3D924A8A] rounded-[10px] flex-grow-[4.3] p-2 text-center text-white'>
          <p className='mb-2'>{t('SHARED.REACTION_RATING.TRUSTWORTHY')}</p>
          <div id='emoji-picker' className='flex gap-3 justify-center'>
            {emojis.map((emoji) => (
              <li
                key={emoji.value}
                onClick={() => handleEmojiClick(emoji.value)}
                className={`${selectedEmoji !== emoji.value ? 'bg-transparent' : 'bg-primary'} outline-[#090C49] ${emojiBtnClass}`}
              >
                <div>
                  <p className='text-3xl md:py-2 py-1'>{emoji.unicode}</p>
                  <p className='md:text-[16px] text-[14px]'>{emoji.name}</p>
                  {reviews && <p>{reviews[emoji.name]}</p>}
                </div>
              </li>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-2">
        <TextArea
          placeholder={t('SCREEN.BUY_FROM_SELLER.ADDITIONAL_COMMENTS_PLACEHOLDER')}
          value={comments}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setComments(e.target.value)}
          maxLength={250}
          disabled={isSaveLoading}
        />
      </div>

      <div className="mb-2">
        <FileInput
          describe={t('SHARED.PHOTO.UPLOAD_PHOTO_REVIEW_PLACEHOLDER')}
          imageUrl={previewImage}
          handleAddImage={handleAddImage}
          isEditMode={isEditMode}
        />
      </div>

      <div className="mb-7">
        <button
          onClick={handleSave}
          disabled={!isSaveEnabled}
          className={`${isSaveEnabled ? 'opacity-100' : 'opacity-50'} px-6 py-2 bg-primary text-white text-xl rounded-md flex justify-right ms-auto text-[15px]`}
        >
          {t('SHARED.SAVE')}
        </button>
      </div>
    </div>
  );
}
"use client";

import { useTranslations } from 'next-intl';
import { useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';

import { IReviewFeedback } from '@/constants/types';
import { createReview, updateReview } from '@/services/reviewsApi';
import removeUrls from '@/utils/sanitize';
import { FileInput, TextArea } from '../Forms/Inputs/Inputs';
import { AppContext } from '../../../../context/AppContextProvider';
import logger from '../../../../logger.config.mjs';

interface Emoji {
  name: string;
  unicode: string;
  code: string;
  value: number;
}

// TODO - Isolate EmojiPicker component; move page processing to sale-items\[id]\page.tsx.
export default function EmojiPicker(props: any) {
  const t = useTranslations();

  const despairEmoji: Emoji = { name: t('SHARED.REACTION_RATING.EMOTIONS.DESPAIR'), unicode: "😠", code: ":despair:", value: 0 };
  const emojis: Emoji[] = [
    { name: t('SHARED.REACTION_RATING.EMOTIONS.SAD'), unicode: "🙁", code: ":sad_face:", value: 2 },
    { name: t('SHARED.REACTION_RATING.EMOTIONS.OKAY'), unicode: "🙂", code: ":okay_face:", value: 3 },
    { name: t('SHARED.REACTION_RATING.EMOTIONS.HAPPY'), unicode: "😃", code: ":happy_face:", value: 4 },
    { name: t('SHARED.REACTION_RATING.EMOTIONS.DELIGHT'), unicode: "😍", code: ":delight_face:", value: 5 }
  ];

  const [dbReviewFeedback, setDbReviewFeedback] = useState<IReviewFeedback | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string>(props.initialImage || '');
  const [isSaveEnabled, setIsSaveEnabled] = useState<boolean>(false);
  // Initialize from props.initialComment if provided
  const [comments, setComments] = useState(props.initialComment || '');
  const [reviewEmoji, setReviewEmoji] = useState<number | null>(null);
  const [selectedEmoji, setSelectedEmoji] = useState<number | null>(null);
  const { showAlert, setAlertMessage, isSaveLoading, setIsSaveLoading, setReload } = useContext(AppContext);

  // function preview image upload 
  useEffect(() => {
    if (props.initialRating !== undefined && props.initialRating !== null) {
      setReviewEmoji(props.initialRating);
      setSelectedEmoji(props.initialRating);
    }
  }, [props.initialRating]);

  useEffect(() => {
    if (props.initialImage !== undefined) {
      setPreviewImage(props.initialImage);
    }
  }, [props.initialImage]);

  useEffect(() => {
    if (props.initialComment !== undefined) {
      setComments(props.initialComment);
    }
  }, [props.initialComment]);

  useEffect(() => {
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setPreviewImage(objectUrl);
    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  // set the preview image if dbUserSettings changes
  useEffect(() => {
    if (dbReviewFeedback?.image) {
      setPreviewImage(dbReviewFeedback.image);
    }
  }, [dbReviewFeedback]);

  // function to toggle save button
  useEffect(() => {
    // Compare current state with initial values
    const hasChanges =
      comments !== (props.initialComment || '') ||
      reviewEmoji !== props.initialRating ||
      previewImage !== (props.initialImage || '');

    setIsSaveEnabled(hasChanges);
    props.setIsSaveEnabled(hasChanges);
  }, [comments,
    reviewEmoji,
    previewImage,
  ]);

  const handleCommentsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComments(e.target.value);
  };

  const handleAddImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isSaveLoading) {
      return;
    }
    const selectedFile = e.target.files?.[0]; // only take the first file
    if (selectedFile) {
      setFile(selectedFile);

      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewImage(objectUrl);
      logger.info('Image selected for upload:', { selectedFile });

      setIsSaveEnabled(true);
    }
  };

  const resetReview = () => {
    setSelectedEmoji(null);
    setReviewEmoji(null);
    setComments('');
    setPreviewImage('');
    setFile(null);
    setIsSaveEnabled(false);
    props.setIsSaveEnabled(false);
  }

  const buildFormData = (isEdit: boolean): FormData => {
    const formData = new FormData();
    formData.append('comment', removeUrls(comments));
    formData.append('rating', reviewEmoji!.toString());
    if (file) {
      formData.append('image', file);
    } else {
      formData.append('image', '');
    }

    if (!isEdit) {
      formData.append('review_receiver_id', props.userId);
      formData.append('reply_to_review_id', props.replyToReviewId || '');
    }
    return formData;
  };

  const validate = () => {
    if (!props.currentUser) {
      logger.warn('Unable to submit review; user not authenticated.');
      toast.error(t('SHARED.VALIDATION.SUBMISSION_FAILED_USER_NOT_AUTHENTICATED'));
      return false;
    }
    if (props.currentUser.pi_uid === props.userId) {
      logger.warn(`Attempted self review by user ${props.currentUser.pi_uid}`);
      toast.error(t('SCREEN.REPLY_TO_REVIEW.VALIDATION.SELF_REVIEW_NOT_POSSIBLE'));
      return false;
    }
    if (reviewEmoji === null) {
      logger.warn('Attempted to save review without selecting an emoji.');
      toast.warn(t('SHARED.REACTION_RATING.VALIDATION.SELECT_EMOJI_EXPRESSION'));
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

      const formData = buildFormData(props.isEditMode);

      if (props.isEditMode && props.reviewId) {
        await updateReview(props.reviewId, formData);
        setReload(true);
      } else {
        await createReview(formData);
      }

      resetReview();
    } catch (error) {
      logger.error('Error saving review:', error);
    } finally {
      setIsSaveLoading(false);
      setAlertMessage(null);
    }
  };
  
  // Function to handle the click of an emoji
  const handleEmojiClick = (emojiValue: number) => {
    if (isSaveLoading) {
      return;
    }
    if (selectedEmoji === emojiValue) {
      setSelectedEmoji(null);
      setReviewEmoji(null); // return null when no emoji is sellected
    } else {
      setSelectedEmoji(emojiValue);
      setReviewEmoji(emojiValue);  // return selected emoji value
    }
  };

  const getReview = (reviews: { [key: string]: number } | undefined, emojiName: string): number | undefined => {
    if (reviews) {
      return reviews[emojiName];
    }
    return undefined;
  };

  const emojiBtnClass = 'rounded-md w-full outline outline-[0.5px] flex justify-center items-center cursor-pointer p-1'
  
  return (
    <div className="mb-3">
        <p>{t('SCREEN.REPLY_TO_REVIEW.FACE_SELECTION_REVIEW_MESSAGE')}</p>
      <div className='flex sm:overflow-hidden overflow-auto gap-3 w-full text-center justify-center my-2'>
        <div className='bg-[#DF2C2C33] flex-grow-[0.5] rounded-md p-2'>
          <p className='text-red-700 mb-2'>{t('SHARED.REACTION_RATING.UNSAFE')}</p>
          <div
            onClick={() => !props.clickDisabled ? handleEmojiClick(despairEmoji.value) : undefined}
            className={`${selectedEmoji !== despairEmoji.value ? 'bg-red-200' : 'bg-red-700'} outline-[#DF2C2C] ${emojiBtnClass}`}
          >
            <div>
              <p className='text-3xl md:py-2 py-1'>{despairEmoji.unicode}</p>
              <p className={`md:text-[16px] text-[14px] ${selectedEmoji == despairEmoji.value && 'text-white'}`}>{despairEmoji.name}</p>
              {props.reviews && (
                <p>{getReview(props.reviews, despairEmoji.name)}</p>
              )}
            </div>
          </div>
        </div>
        <div className='bg-[#3D924A8A] rounded-[10px] flex-grow-[4.3] flex-4 p-2 text-center text-white'>
          <p className='mb-2'>{t('SHARED.REACTION_RATING.TRUSTWORTHY')}</p>
          <div id='emoji-picker' className='flex gap-3 justify-center'>
            {emojis.map((emoji, index) => (
              <li
                key={index}
                onClick={() => !props.clickDisabled ? handleEmojiClick(emoji.value) : undefined}
                className={`${selectedEmoji !== emoji.value ? 'bg-transparent' : 'bg-primary'} outline-[#090C49] ${emojiBtnClass}`}
              >
                <div>
                  <p className='text-3xl md:py-2 py-1'>{emoji.unicode}</p>
                  <p className='md:text-[16px] text-[14px]'>{emoji.name}</p>
                  {props.reviews && (
                    <p>{getReview(props.reviews, emoji.name)}</p>
                  )}                                 
                </div>
              </li>
            ))}
          </div>
        </div>
      </div>
      <div className="mb-2">
        <TextArea placeholder={t('SCREEN.BUY_FROM_SELLER.ADDITIONAL_COMMENTS_PLACEHOLDER')} 
        value={comments} 
        onChange={handleCommentsChange} 
        maxLength={250}
        disabled={isSaveLoading}
        />
      </div>
      <div className="mb-2">
        <FileInput 
          describe={t('SHARED.PHOTO.UPLOAD_PHOTO_REVIEW_PLACEHOLDER')} 
          imageUrl={previewImage} 
          handleAddImage={handleAddImage}
          isEditMode={props.isEditMode} 
        />
      </div>

      {/* Save Button */}
      <div className="mb-7">
        <button
          onClick={handleSave}
          disabled={!isSaveEnabled}
          className={`${isSaveEnabled ? 'opacity-100' : 'opacity-50'} px-6 py-2 bg-primary text-white text-xl rounded-md flex justify-right ms-auto text-[15px]`}> 
            {t('SHARED.SAVE')}
        </button>
      </div>
    </div>
  );  
}

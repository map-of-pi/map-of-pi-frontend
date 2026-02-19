"use client";

import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useContext } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa6';
import ConfirmDialog from '@/components/shared/confirm';
import EmojiPicker from '@/components/shared/Review/emojipicker';
import Skeleton from '@/components/skeleton/skeleton';
import { IReviewOutput, ReviewInt } from '@/constants/types';
import { fetchSingleReview } from '@/services/reviewsApi';
import { fetchUserSettings } from '@/services/userSettingsApi';
import { checkAndAutoLoginUser } from '@/utils/auth';
import { resolveDate } from '@/utils/date';
import { getImageSrc } from '@/utils/image';
import { resolveRating } from '../../util/ratingUtils';
import { AppContext } from '../../../../../../../context/AppContextProvider';
import logger from '../../../../../../../logger.config.mjs';

interface ReplyToReviewPageProps {
  params: {
    id: string;
  };
  searchParams: {
    user_name: string;
  };
}

/**
 * ReplyToReviewPage Component
 * Manages the interface for viewing a review thread and submitting replies.
 * Enhanced with robust error boundaries and safe data processing for thread resolution.
 */
export default function ReplyToReviewPage({ params }: ReplyToReviewPageProps) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();

  const reviewId = params.id;

  const [isSaveEnabled, setIsSaveEnabled] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [reviews, setReviews] = useState<ReviewInt[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userFallbackImage, setUserFallbackImage] = useState<string | null>(null);
  const { currentUser, authenticateUser, reload, setReload } = useContext(AppContext);

  /**
   * Processes raw review output from the API into a formatted UI structure.
   * Includes default fallbacks for comments and localized date/rating resolution.
   */
  const processReviews = (data: IReviewOutput[]): ReviewInt[] => {
    if (!data) return [];
    return data.map((feedback) => {
      const { date, time } = resolveDate(feedback.review_date, locale);
      const { reaction = 'No Reaction', unicode = '😐' } = resolveRating(feedback.rating) || {};
      
      return {
        heading: feedback.comment || t('SHARED.NO_COMMENT'),
        date,
        time,
        giver: feedback.giver || t('SHARED.UNKNOWN_USER'),
        receiver: feedback.receiver || t('SHARED.UNKNOWN_USER'),
        receiverId: feedback.review_receiver_id,
        giverId: feedback.review_giver_id,
        reviewId: feedback._id,
        reaction,
        unicode,
        image: feedback.image
      };
    });
  };
  
  /**
   * Effect hook to fetch initial review data and user display settings.
   * Synchronized with the global timeout configuration (60s) for reliability.
   */
  useEffect(() => {
    checkAndAutoLoginUser(currentUser, authenticateUser);

    const getReviewData = async () => {
      if (!reviewId) return;

      try {
        logger.info(`Fetching review thread for ID: ${reviewId}`);
        setError(null);
        const data = await fetchSingleReview(reviewId);

        if (data && data.review) {
          const reviewList: IReviewOutput[] = [];
          reviewList.push(data.review); // Main review serves as the thread root
          if (data.replies && Array.isArray(data.replies)) {
            reviewList.push(...data.replies);
          }
          const processedReplies = processReviews(reviewList);
          setReviews(processedReplies);
        } else {
          logger.warn(`Review thread resolution returned no data for ID: ${reviewId}`);
          setReviews([]);
        }
      } catch (error) {
        logger.error(`Critical error fetching review thread: ${reviewId}`, error);
        setError(t('SCREEN.REPLY_TO_REVIEW.VALIDATION.LOADING_REVIEW_FAILURE') || 'Error fetching review.');
      } finally {
        setLoading(false);
        setReload(false);
      }
    };

    const loadUserImage = async () => {
      try {
        const settings = await fetchUserSettings();
        if (settings?.image) {
          setUserFallbackImage(settings.image);
        }
      } catch (error) {
        logger.warn('Could not fetch fallback user image settings', error);
      }
    };

    getReviewData();
    loadUserImage();
  }, [reviewId, currentUser, reload, t, setReload]);

  /**
   * Navigation controls for the review thread carousel.
   */
  const prevSlide = () => {
    if (reviews.length > 1 && currentIndex > 0) {
      setCurrentIndex((prevIndex) => prevIndex - 1);
    }
  };

  const nextSlide = () => {
    if (reviews.length > 1 && currentIndex < reviews.length - 1) {
      setCurrentIndex((prevIndex) => prevIndex + 1);
    }
  };

  // Loading state with standardized skeleton feedback
  if (loading) {
    logger.info('Rendering ReplyToReviewPage skeleton state...');
    return <Skeleton type="seller_review" />;
  }

  return (
    <div className="w-full md:w-[500px] md:mx-auto p-4 animate-fadeIn">
      <h1 className="mb-5 font-bold text-lg md:text-2xl">
        {t('SCREEN.REPLY_TO_REVIEW.REPLY_TO_REVIEW_STATIC_HEADER')}
      </h1>
      
      {error && (
        <div className="text-red-700 text-center text-lg py-5">
          {t('SCREEN.REPLY_TO_REVIEW.VALIDATION.LOADING_REVIEW_FAILURE')}
        </div>
      )}

      {reviews && reviews.length > 0 && (
        <div className="mt-2">
          <h2 className="font-bold mb-2">{t('SCREEN.REPLY_TO_REVIEW.REPLY_TO_REVIEW_SUBHEADER')}</h2>

          {/* Carousel for Review Thread History */}
          <div className="relative overflow-hidden mb-5">
            <div
              className="flex transition-transform duration-300 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {reviews.map((review, index) => (
                <div key={review.reviewId || index} className="seller_item_container p-2 w-full shrink-0">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-grow">
                      <p className="text-primary text-sm font-medium">
                        {review.giver} {' → '}
                        <span className="text-primary text-sm">{review.receiver}</span>
                      </p>
                      <p className="text-md break-words mt-1">{review.heading}</p>
                    </div>

                    <div className="flex flex-col items-end space-y-2">
                      <div className="text-[#828282] text-sm text-right whitespace-nowrap">
                        <p>{review.date}</p>
                        <p>{review.time}</p>
                      </div>
                      <div className="flex gap-2 items-center">
                        {(() => {
                          const imgSrc = getImageSrc(review.image, userFallbackImage);
                          return imgSrc ? (
                            <Image
                              src={imgSrc}
                              alt="review meta image"
                              width={50}
                              height={50}
                              className="object-cover rounded-md border border-gray-100 shadow-sm"
                            />
                          ) : null;
                        })()}
                        <p className="text-xl max-w-[50px]" title={review.reaction}>
                          {review.unicode}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Navigation Arrows for the carousel */}
                  <div className="flex mt-2">
                    <button
                      className={`p-2 rounded-full transition-all group hover:bg-gray-100 ${currentIndex === 0 ? 'opacity-30 cursor-not-allowed' : 'opacity-100'}`}
                      onClick={prevSlide}
                      disabled={currentIndex === 0}
                      aria-label="Previous Review"
                    >
                      <FaChevronLeft className="text-gray-400 group-hover:text-gray-600 text-2xl" />
                    </button>
                    <button
                      className={`ms-auto p-2 rounded-full transition-all group hover:bg-gray-100 ${currentIndex === reviews.length - 1 ? 'opacity-30 cursor-not-allowed' : 'opacity-100'}`}
                      onClick={nextSlide}
                      disabled={currentIndex === reviews.length - 1}
                      aria-label="Next Review"
                    >
                      <FaChevronRight className="text-gray-400 group-hover:text-gray-600 text-2xl" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Response Section */}
          <div className="reply-form-section border-t border-gray-100 pt-5 mt-5">
            <h2 className="font-bold">{t('SCREEN.REPLY_TO_REVIEW.GIVE_REPLY_TO_REVIEW_SUBHEADER')}</h2>
            <h2 className="text-[#828282] mb-4">
              {currentUser?.user_name === reviews[currentIndex].giver
                ? reviews[currentIndex]?.receiver
                : reviews[currentIndex].giver}
            </h2>
            <EmojiPicker
              userId={
                currentUser?.pi_uid === reviews[currentIndex].giverId
                  ? reviews[currentIndex]?.receiverId
                  : reviews[currentIndex].giverId
              }
              setIsSaveEnabled={setIsSaveEnabled}
              replyToReviewId={reviews[currentIndex]?.reviewId}
              currentUser={currentUser}
              setReload={setReload}
            />
          </div>
        </div>
      )}

      <ConfirmDialog
        show={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={() => {
          setShowConfirmDialog(false);
          router.push(`/${linkUrl}`);
        }}
        message={t('SHARED.CONFIRM_DIALOG')}
        url={linkUrl}
      />
    </div>
  );
}

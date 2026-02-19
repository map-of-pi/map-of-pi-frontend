'use client';

import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, useRef, useContext } from 'react';
import { toast } from 'react-toastify';
import { resolveRating } from '../util/ratingUtils';
import { OutlineBtn } from '@/components/shared/Forms/Buttons/Buttons';
import EmojiPicker from '@/components/shared/Review/emojipicker';
import ToggleCollapse from '@/components/shared/Seller/ToggleCollapse';
import Skeleton from '@/components/skeleton/skeleton';
import { IReviewOutput, ReviewInt } from '@/constants/types';
import SearchIcon from '@mui/icons-material/Search';
import { FormControl, TextField } from '@mui/material';
import { fetchReviews } from '@/services/reviewsApi';
import { fetchUserSettings } from '@/services/userSettingsApi';
import { checkAndAutoLoginUser } from '@/utils/auth';
import { resolveDate } from '@/utils/date';
import { getImageSrc } from '@/utils/image';
import { AppContext } from '../../../../../../context/AppContextProvider';
import logger from '../../../../../../logger.config.mjs';

/**
 * SellerReviews Component
 * Manages and displays reviews given and received by a Pioneer.
 * Enhanced with robust error handling for high-volume data and input sanitization.
 */
function SellerReviews({
  params,
  searchParams,
}: {
  params: any;
  searchParams: any;
}) {
  const t = useTranslations();
  const userName = useRef<string>(searchParams.user_name);
  const userId = params.id;
  const locale = useLocale();

  const [giverReviews, setGiverReviews] = useState<ReviewInt[] | null>(null);
  const [receiverReviews, setReceiverReviews] = useState<ReviewInt[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaveEnabled, setIsSaveEnabled] = useState(false);
  const [userFallbackImage, setUserFallbackImage] = useState<string | null>(null);
  const { currentUser, reload, setReload, authenticateUser } = useContext(AppContext);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchBarValue, setSearchBarValue] = useState('');
  const [toUser, setToUser] = useState('');

  /**
   * Initial effect to authenticate user and load reviews.
   * Also fetches fallback user settings for review images.
   */
  useEffect(() => {
    checkAndAutoLoginUser(currentUser, authenticateUser);
    fetchUserReviews(userId);

    const loadUserImage = async () => {
      try {
        const settings = await fetchUserSettings();
        if (settings?.image) {
          setUserFallbackImage(settings.image);
        }
      } catch (error) {
        logger.warn('Could not fetch fallback user image', error);
      }
    };

    loadUserImage();
  }, [userId, currentUser]);

  /**
   * Reusable function to process and filter review data for UI consumption.
   * Ensures date and rating resolution are handled consistently.
   */
  const processReviews = (data: IReviewOutput[]): ReviewInt[] => {
    if (!data) return [];
    
    return data
      .map((feedback: IReviewOutput) => {
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
          image: feedback.image
        };
      })
      .filter((review): review is ReviewInt => review !== null);
  };

  /**
   * Fetches reviews for a specific user ID.
   * Optimized to handle empty states and log successful retrievals.
   */
  const fetchUserReviews = async (userId_: string) => {
    if (!userId_) return;
    
    setError(null);
    setReload(true);
    try {
      setToUser(userId_);
      logger.info(`Fetching reviews for userID: ${userId_}`);
      const data = await fetchReviews(userId_);

      if (data) {
        setGiverReviews(processReviews(data.givenReviews || []));
        setReceiverReviews(processReviews(data.receivedReviews || []));
        
        logger.info(`Reviews processed for ${userId_}: ${data.givenReviews?.length} given, ${data.receivedReviews?.length} received.`);
      } else {
        logger.warn(`No data returned for userID: ${userId_}`);
        setGiverReviews([]);
        setReceiverReviews([]);
      }
    } catch (error) {
      logger.error(`Critical error fetching reviews for userID: ${userId_}`, error);
      setError(t('SCREEN.REVIEWS.VALIDATION.FETCH_ERROR_MESSAGE') || 'Error fetching reviews.');
    } finally {
      setLoading(false);
      setReload(false);
    }
  };

  /**
   * Handles the search logic for Pioneers.
   * Includes input trimming and intelligent error handling for server timeouts vs. missing users.
   */
  const handleSearch = async () => {
    const query = searchBarValue.trim();
    if (!query) {
      toast.warn(t('SCREEN.REVIEWS.VALIDATION.EMPTY_SEARCH'));
      return;
    }

    setReload(true);
    setError(null);
    try {
      logger.info(`Searching reviews for query: ${query}`);
      const data = await fetchReviews(userId, query);

      if (data && (data.givenReviews?.length > 0 || data.receivedReviews?.length > 0)) {
        setGiverReviews(processReviews(data.givenReviews || []));
        setReceiverReviews(processReviews(data.receivedReviews || []));

        // Update UI context based on search results
        if (data.givenReviews?.length > 0) {
          setToUser(data.givenReviews[0].review_giver_id);
          userName.current = data.givenReviews[0].giver;
        } else if (data.receivedReviews?.length > 0) {
          setToUser(data.receivedReviews[0].review_receiver_id);
          userName.current = data.receivedReviews[0].receiver;
        }
      } else {
        toast.error(t('SCREEN.REVIEWS.VALIDATION.NO_REVIEWS_FOUND', { search_value: query }));
        setGiverReviews([]);
        setReceiverReviews([]);
      }
    } catch (error: any) {
      // Differentiate between "Not Found" and "Server Overload/Timeout"
      if (error.message === 'SERVER_TIMEOUT_ERROR' || error.message === 'SERVER_DATA_LIMIT_ERROR') {
        toast.error(t('SCREEN.REVIEWS.VALIDATION.SERVER_BUSY_MESSAGE') || 'Server is busy processing high volume data. Please try again.');
        logger.error(`High volume data error for query: ${query}`);
      } else {
        toast.error(t('SCREEN.REVIEWS.VALIDATION.NO_PIONEER_FOUND', { search_value: query }));
        logger.warn(`Pioneer search failed for: ${query}`);
      }
    } finally {
      setReload(false);
    }
  };

  const handleSearchBarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchBarValue(event.target.value);
  };

  /**
   * Initial loading state rendering.
   */
  if (loading) {
    logger.info('Rendering initial seller reviews skeleton...');
    return <Skeleton type='seller_review' />;
  }

  return (
    <>
      {error && <div className="error text-center text-red-400 py-2">{error}</div>}
      <div className="px-4 py-[20px] text-[#333333] sm:max-w-[520px] w-full m-auto gap-5">
        <h1 className="text-[#333333] text-lg font-semibold md:font-bold md:text-2xl mb-1">
          {t('SCREEN.REVIEWS.REVIEWS_HEADER')}
        </h1>

        {/* Pioneer Search Section */}
        <div className='flex gap-3 items-center justify-items-center py-3'>
          <span>{t('SHARED.PIONEER_LABEL')}</span>
          <FormControl className="flex-grow mr-2">
            <TextField
              id="search-input"
              type="text"
              variant="outlined"
              color="success"
              className="bg-none hover:bg-gray-100 w-full rounded-lg"
              placeholder={userName.current}
              value={searchBarValue}
              onChange={handleSearchBarChange}
              ref={inputRef}
              autoComplete="off"
              inputProps={{
                autoCorrect: 'off',
                autoCapitalize: 'off',
                spellCheck: 'false',
              }}
            />
          </FormControl>
          <button
            aria-label="search"
            onClick={handleSearch}
            className="bg-primary rounded h-full w-15 p-[15.5px] flex items-center justify-center transition-colors hover:bg-opacity-80"
          >
            <SearchIcon className="text-[#ffc153]" />
          </button>
        </div>

        {/* Give a Review Section */}
        <ToggleCollapse header={t('SCREEN.REVIEWS.GIVE_REVIEW_SECTION_HEADER')}>
          <div>
            <EmojiPicker 
              userId={toUser} 
              setIsSaveEnabled={setIsSaveEnabled} 
              currentUser={currentUser} 
              setReload={setReload} 
              refresh={fetchUserReviews} 
            />
          </div>
        </ToggleCollapse>      

        {/* Reviews Given Section */}
        <ToggleCollapse header={t('SCREEN.REVIEWS.REVIEWS_GIVEN_SECTION_HEADER')}>
          {reload 
            ? <Skeleton type='seller_review' />
            : giverReviews && giverReviews.map((review, index) => (
              <div key={review.reviewId || index} className="seller_item_container mb-5">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-grow">
                    <p className="text-primary text-sm">
                      {review.giver} {' → '}
                      <span className="text-primary text-sm">
                        {review.receiver}
                      </span>
                    </p>
                    <p className="text-md break-words">{review.heading}</p>
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
                            alt="review image"
                            width={50}
                            height={50}
                            className="object-cover rounded-md"
                          />
                        ) : null;
                      })()}
                      <p className="text-xl max-w-[50px]" title={review.reaction}>
                        {review.unicode}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-2 w-full">
                  {review.giverId === currentUser?.pi_uid && (
                    <Link href={`/${locale}/seller/reviews/${review.reviewId}/edit?user_name=${encodeURIComponent(review.receiver)}`}>
                      <OutlineBtn label={t('SHARED.EDIT')} />
                    </Link>
                  )}
                  <Link href={`/${locale}/seller/reviews/feedback/${review.reviewId}?user_name=${encodeURIComponent(review.giver)}`}>
                    <OutlineBtn label={t('SHARED.REPLY')} />
                  </Link>
                </div>
              </div>
            ))
          }
        </ToggleCollapse>
 
        {/* Reviews Received Section */}
        <ToggleCollapse header={t('SCREEN.REVIEWS.REVIEWS_RECEIVED_SECTION_HEADER')} open={true}>
        {reload
          ? <Skeleton type='seller_review' />
          : receiverReviews && receiverReviews.map((review, index) => (
            <div key={review.reviewId || index} className="seller_item_container mb-5">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-grow">
                  <p className="text-primary text-sm">
                    {review.giver} {' → '}
                    <span className="text-primary text-sm">
                      {review.receiver}
                    </span>
                  </p>
                  <p className="text-md break-words">{review.heading}</p>
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
                          alt="review image"
                          width={50}
                          height={50}
                          className="object-cover rounded-md"
                        />
                      ) : null;
                    })()}
                    <p className="text-xl max-w-[50px]" title={review.reaction}>
                      {review.unicode}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center mt-2 w-full">
                {review.giverId === currentUser?.pi_uid && (
                  <Link href={`/${locale}/seller/reviews/${review.reviewId}/edit?user_name=${encodeURIComponent(review.receiver)}`}>
                    <OutlineBtn label={t('SHARED.EDIT')} />
                  </Link>
                )}
                <Link href={`/${locale}/seller/reviews/feedback/${review.reviewId}?user_name=${encodeURIComponent(review.giver)}`}>
                  <OutlineBtn label={t('SHARED.REPLY')} />
                </Link>
              </div>
            </div>
          ))
        }
        </ToggleCollapse>
      </div>
    </>
  );
}

export default SellerReviews;

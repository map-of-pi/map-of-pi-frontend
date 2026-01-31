'use client';
import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, useRef, useContext, useCallback } from 'react';
import { toast } from 'react-toastify';
import { resolveRating } from '../util/ratingUtils';
import { OutlineBtn } from '@/components/shared/Forms/Buttons/Buttons';
import EmojiPicker from '@/components/shared/Review/emojipicker';
import ToggleCollapse from '@/components/shared/Seller/ToggleCollapse';
/**
 * FIX: Updated import path to match the new unique filename 'MainSkeleton'.
 * This resolves 'Module not found' without breaking the existing skeleton logic.
 */
import Skeleton from '@/components/skeleton/MainSkeleton';
import { IReviewOutput, ReviewInt } from '@/constants/types';
import SearchIcon from '@mui/icons-material/Search';
import { FormControl, TextField } from '@mui/material';
import { fetchReviews } from '@/services/reviewsApi';
import { fetchUserSettings } from '@/services/userSettingsApi';
import { usePagination } from '@/hooks/usePagination'; // Safe integration
import { checkAndAutoLoginUser } from '@/utils/auth';
import { resolveDate } from '@/utils/date';
import { getImageSrc } from '@/utils/image';
import { AppContext } from '../../../../../../context/AppContextProvider';
import logger from '../../../../../../logger.config.mjs';

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

  const [userFallbackImage, setUserFallbackImage] = useState<string | null>(null);
  const { currentUser, reload, setReload, authenticateUser } = useContext(AppContext);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchBarValue, setSearchBarValue] = useState('');
  const [toUser, setToUser] = useState(userId);

  /**
   * Helper to process review data.
   * Updated to ensure 'reaction' and 'unicode' are never undefined, 
   * satisfying the ReviewInt interface during production build.
   */
  const processReviews = useCallback((data: IReviewOutput[]): ReviewInt[] => {
    return data.map((feedback: IReviewOutput) => {
      const { date, time } = resolveDate(feedback.review_date, locale);
      const { reaction, unicode } = resolveRating(feedback.rating) || {};
      
      return {
        heading: feedback.comment || '',
        date,
        time,
        giver: feedback.giver || '',
        receiver: feedback.receiver || '',
        giverId: feedback.review_giver_id || '',
        receiverId: feedback.review_receiver_id || '',
        reviewId: feedback._id || '',
        // FIX: Ensure values are strings to match ReviewInt type definition
        reaction: reaction || '',
        unicode: unicode || '', 
        image: feedback.image || ''
      };
    });
  }, [locale]);

  /**
   * Safe Pagination for Received Reviews
   * Fetches data using the new page/limit pattern while using the existing processReviews logic.
   */
  const { 
    data: receivedReviews, 
    loading: loadingReceived, 
    lastElementRef: lastReceivedRef, 
    hasNextPage: hasMoreReceived,
    refresh: refreshReceived 
  } = usePagination<ReviewInt>(
    async (page, limit) => {
      const res = await fetchReviews(userId, searchBarValue, page, limit);
      // Backend returns receivedReviews and givenReviews in the response
      return { ...res, docs: processReviews(res.receivedReviews || []) };
    }, 
    10
  );

  /**
   * Safe Pagination for Given Reviews
   */
  const { 
    data: giverReviews, 
    loading: loadingGiven, 
    lastElementRef: lastGivenRef, 
    hasNextPage: hasMoreGiven,
    refresh: refreshGiven
  } = usePagination<ReviewInt>(
    async (page, limit) => {
      const res = await fetchReviews(userId, searchBarValue, page, limit);
      return { ...res, docs: processReviews(res.givenReviews || []) };
    }, 
    10
  );

  useEffect(() => {
    checkAndAutoLoginUser(currentUser, authenticateUser);
    const loadUserImage = async () => {
      try {
        const settings = await fetchUserSettings();
        if (settings?.image) setUserFallbackImage(settings.image);
      } catch (error) { logger.warn('Fallback image fail', error); }
    };
    loadUserImage();
  }, [userId, currentUser]);

  const handleSearch = () => {
    refreshReceived();
    refreshGiven();
  };

  const handleSearchBarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchBarValue(event.target.value);
  };

  return (
    <>
      <div className="px-4 py-[20px] text-[#333333] sm:max-w-[520px] w-full m-auto gap-5">
        <h1 className="text-[#333333] text-lg font-semibold md:font-bold md:text-2xl mb-1">
          {t('SCREEN.REVIEWS.REVIEWS_HEADER')}
        </h1>

        {/* Search area - Unchanged UI */}
        <div className='flex gap-3 items-center justify-items-center py-3'>
          <span>{t('SHARED.PIONEER_LABEL')}</span>
          <FormControl className="flex-grow mr-2">
            <TextField
              id="search-input"
              className="bg-none hover:bg-gray-100 w-full rounded-lg"
              placeholder={userName.current}
              value={searchBarValue}
              onChange={handleSearchBarChange}
              ref={inputRef}
            />
          </FormControl>
          <button onClick={handleSearch} className="bg-primary rounded h-full w-15 p-[15.5px] flex items-center justify-center">
            <SearchIcon className="text-[#ffc153]" />
          </button>
        </div>

        <ToggleCollapse header={t('SCREEN.REVIEWS.GIVE_REVIEW_SECTION_HEADER')}>
          <EmojiPicker userId={toUser} setIsSaveEnabled={() => {}} currentUser={currentUser} setReload={setReload} refresh={handleSearch} />
        </ToggleCollapse>      

        {/* GIVEN REVIEWS SECTION */}
        <ToggleCollapse header={t('SCREEN.REVIEWS.REVIEWS_GIVEN_SECTION_HEADER')}>
          {giverReviews.map((review, index) => (
            <div key={review.reviewId} ref={index === giverReviews.length - 1 ? lastGivenRef : null} className="seller_item_container mb-5">
               <div className="flex justify-between items-start mb-3">
                  <div className="flex-grow">
                    <p className="text-primary text-sm">{review.giver} → {review.receiver}</p>
                    <p className="text-md break-words">{review.heading}</p>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <div className="text-[#828282] text-sm text-right whitespace-nowrap">
                      <p>{review.date}</p><p>{review.time}</p>
                    </div>
                    <p className="text-xl">{review.unicode}</p>
                  </div>
               </div>
               <div className="flex justify-between items-center mt-2 w-full">
                  {review.giverId === currentUser?.pi_uid && (
                    <Link href={`/${locale}/seller/reviews/${review.reviewId}/edit`}>
                      <OutlineBtn label={t('SHARED.EDIT')} />
                    </Link>
                  )}
                  <Link href={`/${locale}/seller/reviews/feedback/${review.reviewId}`}>
                    <OutlineBtn label={t('SHARED.REPLY')} />
                  </Link>
               </div>
            </div>
          ))}
          {loadingGiven && <Skeleton type='seller_review' />}
        </ToggleCollapse>
 
        {/* RECEIVED REVIEWS SECTION */}
        <ToggleCollapse header={t('SCREEN.REVIEWS.REVIEWS_RECEIVED_SECTION_HEADER')} open={true}>
          {receivedReviews.map((review, index) => (
            <div key={review.reviewId} ref={index === receivedReviews.length - 1 ? lastReceivedRef : null} className="seller_item_container mb-5">
               <div className="flex justify-between items-start mb-3">
                  <div className="flex-grow">
                    <p className="text-primary text-sm">{review.giver} → {review.receiver}</p>
                    <p className="text-md break-words">{review.heading}</p>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <div className="text-[#828282] text-sm text-right whitespace-nowrap">
                      <p>{review.date}</p><p>{review.time}</p>
                    </div>
                    <p className="text-xl">{review.unicode}</p>
                  </div>
               </div>
            </div>
          ))}
          {receivedReviews.length > 0 && loadingReceived && <Skeleton type='seller_review' />}
        </ToggleCollapse>
      </div>
    </>
  );
}

export default SellerReviews;

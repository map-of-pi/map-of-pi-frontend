'use client';
import { useTranslations, useLocale } from 'next-intl';
import { useEffect, useRef, useContext, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import EmojiPicker from '@/components/shared/Review/emojipicker';
import ToggleCollapse from '@/components/shared/Seller/ToggleCollapse';
import Skeleton from '@/components/skeleton/skeleton';
import SearchIcon from '@mui/icons-material/Search';
import { FormControl, TextField } from '@mui/material';
import { fetchReviews } from '@/services/reviewsApi';
import { fetchUserSettings } from '@/services/userSettingsApi';
import { checkAndAutoLoginUser } from '@/utils/auth';
import { AppContext } from '../../../../../../context/AppContextProvider';
import logger from '../../../../../../logger.config.mjs';
import { useInfiniteReviews, processReviews } from '@/hooks/useInfiniteReviews';
import { ReviewCard } from '@/components/shared/Review/ReviewCard';

interface SellerReviewsProps {
  params: { id: string };
  searchParams: { user_name?: string };
}

function SellerReviews({ params, searchParams }: SellerReviewsProps) {
  const t = useTranslations();
  const locale = useLocale();
  const userId = params.id;
  const userName = useRef<string>(searchParams.user_name ?? '');

  const { currentUser, reload, setReload, authenticateUser } = useContext(AppContext);

  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userFallbackImage, setUserFallbackImage] = useState<string | null>(null);
  const [toUser, setToUser] = useState(userId);
  const [searchBarValue, setSearchBarValue] = useState('');

  // Each hook owns its own cursor — no shared cursor bug
  const given = useInfiniteReviews({ userId, type: 'given', locale });
  const received = useInfiniteReviews({ userId, type: 'received', locale });

  // ─── Initial data load ───────────────────────────────────────────────────────
  const fetchUserReviews = useCallback(async (targetUserId: string) => {
    setError(null);
    setReload(true);
    try {
      setToUser(targetUserId);

      // Parallel fetch — each gets its own correctly-typed cursor
      const [givenData, receivedData] = await Promise.all([
        fetchReviews(targetUserId, undefined, undefined, 'given'),
        fetchReviews(targetUserId, undefined, undefined, 'received'),
      ]);

      given.reset(processReviews(givenData?.reviews ?? [], locale), givenData?.nextCursor);
      received.reset(processReviews(receivedData?.reviews ?? [], locale), receivedData?.nextCursor);
    } catch (err) {
      logger.error('Failed to fetch initial reviews', err);
      setError('Error fetching reviews.');
    } finally {
      setPageLoading(false);
      setReload(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]);

  useEffect(() => {
    checkAndAutoLoginUser(currentUser, authenticateUser);
    fetchUserReviews(userId);

    fetchUserSettings()
      .then((settings) => { if (settings?.image) setUserFallbackImage(settings.image); })
      .catch((err) => logger.warn('Could not fetch fallback user image', err));
  }, [userId, currentUser]);

  // ─── Search ──────────────────────────────────────────────────────────────────
  const handleSearch = async () => {
    setReload(true);
    setError(null);
    try {
      logger.info(`Searching reviews for userID: ${userId} with query: ${searchBarValue}`);

      const [givenData, receivedData] = await Promise.all([
        fetchReviews(userId, searchBarValue, undefined, 'given'),
        fetchReviews(userId, searchBarValue, undefined, 'received'),
      ]);

      const givenResults = processReviews(givenData?.reviews ?? [], locale);
      const receivedResults = processReviews(receivedData?.reviews ?? [], locale);

      given.reset(givenResults, givenData?.nextCursor);
      received.reset(receivedResults, receivedData?.nextCursor);

      if (!givenResults.length && !receivedResults.length) {
        toast.error(t('SCREEN.REVIEWS.VALIDATION.NO_REVIEWS_FOUND', { search_value: searchBarValue }));
        return;
      }

      // Update displayed username from first available result
      const firstGiven = givenData?.reviews?.[0];
      const firstReceived = receivedData?.reviews?.[0];
      if (firstGiven) {
        setToUser(firstGiven.review_giver_id);
        userName.current = firstGiven.giver;
      } else if (firstReceived) {
        setToUser(firstReceived.review_receiver_id);
        userName.current = firstReceived.receiver;
      }
    } catch (err) {
      logger.error(`Pioneer ${searchBarValue} not found`, err);
      toast.error(t('SCREEN.REVIEWS.VALIDATION.NO_PIONEER_FOUND', { search_value: searchBarValue }));
    } finally {
      setReload(false);
    }
  };

  // ─── Render ──────────────────────────────────────────────────────────────────
  if (pageLoading) {
    logger.info('Loading seller reviews...');
    return <Skeleton type="seller_review" />;
  }

  return (
    <>
      {error && <div className="error text-center text-red-400">{error}</div>}

      <div className="px-4 py-[20px] text-[#333333] sm:max-w-[520px] w-full m-auto gap-5">
        <h1 className="text-[#333333] text-lg font-semibold md:font-bold md:text-2xl mb-1">
          {t('SCREEN.REVIEWS.REVIEWS_HEADER')}
        </h1>

        {/* Search */}
        <div className="flex gap-3 items-center justify-items-center py-3">
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
              onChange={(e) => setSearchBarValue(e.target.value)}
              autoCorrect="off"
              autoCapitalize="off"
              autoComplete="off"
              spellCheck={false}
              inputProps={{
                autoCorrect: 'off',
                autoCapitalize: 'off',
                spellCheck: 'false',
                autoComplete: 'new-password',
              }}
            />
          </FormControl>
          <button
            aria-label="search"
            onClick={handleSearch}
            className="bg-primary rounded h-full w-15 p-[15.5px] flex items-center justify-center hover:bg-gray-600"
          >
            <SearchIcon className="text-[#ffc153]" />
          </button>
        </div>

        {/* Give a review */}
        <ToggleCollapse header={t('SCREEN.REVIEWS.GIVE_REVIEW_SECTION_HEADER')}>
          <EmojiPicker
            userId={toUser}
            setIsSaveEnabled={() => {}}
            currentUser={currentUser}
            setReload={setReload}
            refresh={fetchUserReviews}
          />
        </ToggleCollapse>

        {/* Reviews Given */}
        <ToggleCollapse header={t('SCREEN.REVIEWS.REVIEWS_GIVEN_SECTION_HEADER')}>
          {reload ? (
            <Skeleton type="seller_review" />
          ) : (
            given.reviews.map((review, i) => (
              <ReviewCard
                key={review.reviewId ?? i}
                review={review}
                currentUserId={currentUser?.pi_uid}
                userFallbackImage={userFallbackImage}
              />
            ))
          )}
          {given.hasMore && (
            <div ref={given.loaderRef} className="py-4 text-center">
              {given.isLoadingMore && <Skeleton type="seller_review" />}
            </div>
          )}
        </ToggleCollapse>

        {/* Reviews Received */}
        <ToggleCollapse header={t('SCREEN.REVIEWS.REVIEWS_RECEIVED_SECTION_HEADER')} open>
          {reload ? (
            <Skeleton type="seller_review" />
          ) : (
            received.reviews.map((review, i) => (
              <ReviewCard
                key={review.reviewId ?? i}
                review={review}
                currentUserId={currentUser?.pi_uid}
                userFallbackImage={userFallbackImage}
              />
            ))
          )}
          {received.hasMore && (
            <div ref={received.loaderRef} className="py-4 text-center">
              {received.isLoadingMore && <Skeleton type="seller_review" />}
            </div>
          )}
        </ToggleCollapse>
      </div>
    </>
  );
}

export default SellerReviews;

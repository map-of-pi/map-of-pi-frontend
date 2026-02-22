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
  const [isSaveEnabled, setIsSaveEnabled] = useState(false);

  // toUser tracks whose reviews are currently displayed (changes on search)
  const [toUser, setToUser] = useState(userId);
  const [searchBarValue, setSearchBarValue] = useState('');

  const given = useInfiniteReviews({ userId: toUser, type: 'given', locale });
  const received = useInfiniteReviews({ userId: toUser, type: 'received', locale });

  // Stable refs so fetchUserReviews can be included in dep arrays without
  // causing re-renders when the hook identity changes between renders
  const givenResetRef = useRef(given.reset);
  const receivedResetRef = useRef(received.reset);
  useEffect(() => { givenResetRef.current = given.reset; }, [given.reset]);
  useEffect(() => { receivedResetRef.current = received.reset; }, [received.reset]);

  // ─── Initial / refresh load ──────────────────────────────────────────────────
  const fetchUserReviews = useCallback(async (targetUserId: string) => {
    setError(null);
    setReload(true);
    try {
      setToUser(targetUserId);

      const [givenData, receivedData] = await Promise.all([
        fetchReviews(targetUserId, undefined, undefined, 'given'),
        fetchReviews(targetUserId, undefined, undefined, 'received'),
      ]);

      givenResetRef.current(
        processReviews(givenData?.reviews ?? [], locale),
        targetUserId,   // ✅ not undefined
        givenData?.nextCursor ?? undefined
      );

      receivedResetRef.current(
        processReviews(receivedData?.reviews ?? [], locale),
        targetUserId,   // ✅
        receivedData?.nextCursor ?? undefined
      );
    } catch (err) {
      logger.error('Failed to fetch initial reviews', err);
      setError('Error fetching reviews.');
    } finally {
      setPageLoading(false);
      setReload(false);
    }
  }, [locale, setReload]);

  useEffect(() => {
    checkAndAutoLoginUser(currentUser, authenticateUser);
    fetchUserReviews(userId);

    fetchUserSettings()
      .then((settings) => { if (settings?.image) setUserFallbackImage(settings.image); })
      .catch((err) => logger.warn('Could not fetch fallback user image', err));
  }, [userId, currentUser, fetchUserReviews]);

  // EmojiPicker calls refresh() with no args after submitting a review.
  // We wrap fetchUserReviews so it always refreshes the currently viewed user,
  // regardless of what (if anything) EmojiPicker passes.
  const handleRefreshAfterReview = useCallback(() => {
    fetchUserReviews(toUser);
  }, [fetchUserReviews, toUser]);

  // ─── Search ──────────────────────────────────────────────────────────────────
  const handleSearch = async () => {
    if (!searchBarValue.trim()) return;
    setReload(true);
    setError(null);
    try {
      logger.info(`Searching reviews with query: ${searchBarValue}`);

      // Pass searchBarValue as the query — backend resolves it to a pi_uid.
      // We use the page-owner userId as the route param (required by the endpoint),
      // and let the backend's searchQuery override the resolved ID internally.
      const [givenData, receivedData] = await Promise.all([
        fetchReviews(toUser, searchBarValue, undefined, 'given'),
        fetchReviews(toUser, searchBarValue, undefined, 'received'),
      ]);

      const givenResults = processReviews(givenData?.reviews ?? [], locale);
      const receivedResults = processReviews(receivedData?.reviews ?? [], locale);

      given.reset(givenResults, searchBarValue, givenData?.nextCursor ?? undefined);
      received.reset(receivedResults, searchBarValue, receivedData?.nextCursor ?? undefined);

      if (!givenResults.length && !receivedResults.length) {
        toast.error(t('SCREEN.REVIEWS.VALIDATION.NO_REVIEWS_FOUND', { search_value: searchBarValue }));
        return;
      }

       // Resolve the displayed user from whichever result set has data
      const firstRaw = givenData?.reviews?.[0] ?? receivedData?.reviews?.[0];
      if (firstRaw) {
        // The resolved user is the giver for given-type results, receiver otherwise
        const resolvedId = givenData?.reviews?.[0]
          ? firstRaw.review_giver_id
          : firstRaw.review_receiver_id;
        const resolvedName = givenData?.reviews?.[0]
          ? firstRaw.giver
          : firstRaw.receiver;

        setToUser(resolvedId);
        userName.current = resolvedName;
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
              onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
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
            currentUser={currentUser}
            setReload={setReload}
            refresh={handleRefreshAfterReview}
            setIsSaveEnabled={setIsSaveEnabled}
          />
        </ToggleCollapse>

        {/* Reviews Given */}
        <ToggleCollapse header={t('SCREEN.REVIEWS.REVIEWS_GIVEN_SECTION_HEADER')}>
          {reload ? (
            <Skeleton type="seller_review" />
          ) : (
            given.reviews.map((review) => (
              <ReviewCard
                key={review.reviewId}
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
            received.reviews.map((review) => (
              <ReviewCard
                key={review.reviewId}
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

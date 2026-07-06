'use client';
import { useTranslations, useLocale } from 'next-intl';
import { useContext, useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import { FormControl, TextField } from '@mui/material';
import EmojiPicker from '@/components/shared/Review/emojipicker';
import { ReviewCard } from '@/components/shared/Review/ReviewCard';
import ToggleCollapse from '@/components/shared/Seller/ToggleCollapse';
import Skeleton from '@/components/skeleton/skeleton';
import { IReviewOutput, ReviewInt } from '@/constants/types';
import logger from '../../../../../../logger.config.mjs';
import {
  processReviews,
  useCursorInfiniteScroll,
} from '@/hooks/useInfiniteReviews';
import { fetchReviews, activateTrustProtect } from '@/services/reviewsApi';
import { AppContext } from '../../../../../../context/AppContextProvider';

interface SellerReviewsProps {
  params: { id: string };
  searchParams: { user_name?: string };
}

function SellerReviews({ params, searchParams }: SellerReviewsProps) {
  const t = useTranslations();
  const locale = useLocale();
  const { currentUser } = useContext(AppContext);

  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { showAlert } = useContext(AppContext);
  // Displayed user state — starts as the route owner
  const [toUser, setToUser] = useState(params.id);
  const [displayName, setDisplayName] = useState(searchParams.user_name ?? '');

  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  // ─── Search ──────────────────────────────────────────────────────────────────
  const handleSearch = () => {
    const trimmed = searchInput.trim();
    setSearchQuery(trimmed || '');
  };

  const {
    items: givenReviews,
    loading: loadingGiven,
    initialLoading: initialLoadingGiven,
    hasMore: hasMoreGiven,
    sentinelRef: givenObserverRef,
    reset: resetGiven,
  } = useCursorInfiniteScroll<IReviewOutput, ReviewInt>({
    fetchPage: async (cursor) => {
      const data = await fetchReviews(
        toUser,
        searchQuery.trim() || undefined,
        cursor,
        'given',
      );

      if (data?.resolvedUser) {
        setToUser(data.resolvedUser.id);
        setDisplayName(data.resolvedUser.user_name);
      }

      return {
        data: data?.reviews ?? [],
        nextCursor: data?.nextCursor ?? undefined,
      };
    },
    process: (data) => processReviews(data, locale),
    dependencies: [toUser, searchQuery, refreshKey],
  });
  const handleTrustProtect = async (reviewId: string) => {
    try {
      await activateTrustProtect(reviewId);

      showAlert('Trust Protect activated successfully');

      triggerRefresh();
    } catch (error: any) {
      logger.error(
        'Failed to activate Trust Protect:',
        error?.response?.data || error,
      );

      showAlert(
        error?.response?.data?.message || 'Failed to activate Trust Protect.',
      );
    }
  };
  const {
    items: receivedReviews,
    loading: loadingReceived,
    initialLoading: initialLoadingReceived,
    hasMore: hasMoreReceived,
    sentinelRef: receivedObserverRef,
  } = useCursorInfiniteScroll<IReviewOutput, ReviewInt>({
    fetchPage: async (cursor) => {
      const data = await fetchReviews(
        toUser,
        searchQuery.trim() || undefined,
        cursor,
        'received',
      );

      if (data?.resolvedUser) {
        setToUser(data.resolvedUser.id);
        setDisplayName(data.resolvedUser.user_name);
      }

      return {
        data: data?.reviews ?? [],
        nextCursor: data?.nextCursor ?? undefined,
      };
    },
    process: (data) => processReviews(data, locale),
    dependencies: [toUser, searchQuery, refreshKey],
  });

  // ─── Render ──────────────────────────────────────────────────────────────────
  if (initialLoadingReceived && initialLoadingGiven)
    return <Skeleton type="seller_review" />;

  return (
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
            placeholder={displayName}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSearch();
            }}
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
          className="bg-primary rounded h-full w-15 p-[15.5px] flex items-center justify-center hover:bg-gray-600">
          <SearchIcon className="text-[#ffc153]" />
        </button>
      </div>

      {/* Give a review */}
      <ToggleCollapse header={t('SCREEN.REVIEWS.GIVE_REVIEW_SECTION_HEADER')}>
        <EmojiPicker
          userId={toUser}
          currentUser={currentUser}
          refresh={triggerRefresh}
          setIsSaveEnabled={() => {}}
        />
      </ToggleCollapse>

      {/* Reviews Given */}
      <ToggleCollapse header={t('SCREEN.REVIEWS.REVIEWS_GIVEN_SECTION_HEADER')}>
        {initialLoadingGiven ? (
          <Skeleton type="seller_review" />
        ) : (
          givenReviews.map((review) => (
            <ReviewCard
              key={review.reviewId}
              review={review}
              currentUserId={currentUser?.pi_uid}
            />
          ))
        )}

        {hasMoreGiven && !loadingGiven && (
          <div ref={givenObserverRef} className="h-10" />
        )}

        {loadingGiven && <Skeleton type="seller_review" />}
      </ToggleCollapse>

      {/* Reviews Received */}
      <ToggleCollapse
        header={t('SCREEN.REVIEWS.REVIEWS_RECEIVED_SECTION_HEADER')}
        open>
        {initialLoadingReceived ? (
          <Skeleton type="seller_review" />
        ) : (
          receivedReviews.map((review) => (
            <ReviewCard
              key={review.reviewId}
              review={review}
              currentUserId={currentUser?.pi_uid}
              onTrustProtect={handleTrustProtect}
            />
          ))
        )}

        {hasMoreReceived && !loadingReceived && (
          <div ref={receivedObserverRef} className="h-10" />
        )}

        {loadingReceived && <Skeleton type="seller_review" />}
      </ToggleCollapse>
    </div>
  );
}

export default SellerReviews;

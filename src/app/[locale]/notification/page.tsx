'use client';

import { useTranslations } from 'next-intl';
import React, { useContext, useEffect, useRef, useState } from 'react';
import NotificationCard from '@/components/shared/Notification/NotificationCard';
import Skeleton from '@/components/skeleton/skeleton';
import { NotificationType } from '@/constants/types';
import { useScrollablePagination } from '@/hooks/useScrollablePagination';
import { getNotifications, updateNotification } from '@/services/notificationApi';
import { AppContext } from '../../../../context/AppContextProvider';
import logger from '../../../../logger.config.mjs';
import { getNotificationsCount } from '@/services/notificationApi';

export default function NotificationPage() {
  const t = useTranslations();
  const { currentUser } = useContext(AppContext);

  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const { setNotificationsCount, setToggleNotification } = useContext(AppContext);

  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const [skip, setSkip] = useState(0);
  const [limit] = useState(5);
  const [isLoading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const observer = useRef<IntersectionObserver | null>(null);
  
  const handleShopItemRef = (node: HTMLElement | null) => {
    if (node && observer.current) {
      observer.current.observe(node);
    }
  };

  const handleUpdateNotification = async (id: string) => {
  const prev = notifications.find((n) => n._id === id);
  if (!prev) return;

  setNotifications((prevList) =>
    prevList.map((n) =>
      n._id === id ? { ...n, is_cleared: !n.is_cleared } : n
    )
  );

  try {
    await updateNotification(id);

    // Re-fetch fresh notifications to get accurate state
    const fresh = await getNotifications({
      skip: 0,
      limit: 1000,
    });

    setNotifications(fresh);

    const count = await getNotificationsCount();
    setNotificationsCount(count);

  } catch (error) {
    logger.error('Error updating notification:', error);

    // Rollback
    setNotifications((prevList) =>
      prevList.map((n) =>
        n._id === id ? { ...n, is_cleared: prev.is_cleared } : n
      )
    );
  }
};

  const sortNotifications = (
    current: NotificationType[],
    incoming: NotificationType[]
  ): NotificationType[] => {
    const merged = [...current, ...incoming];
    const notCleared = merged.filter((n) => !n.is_cleared);
    const cleared = merged.filter((n) => n.is_cleared);
    return [...notCleared, ...cleared];
  };

  const fetchNotifications = async () => {
    if (isLoading || !currentUser?.pi_uid || !hasMore) return;

    try {
      const newNotifications = await getNotifications({
        skip,
        limit
      });

      logger.info('Fetched notifications:', newNotifications);

      if (newNotifications.length > 0) {
        const sorted = sortNotifications(notifications, newNotifications);
        setNotifications(sorted);
        setSkip(skip + limit);
      }

      if (newNotifications.length < limit) {
        setHasMore(false); // No more pages
      }
    } catch (error) {
      logger.error('Error fetching notifications:', error);
    } finally {
      setHasFetched(true);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!currentUser?.pi_uid) return;

    setNotifications([]);
    setSkip(0);
    fetchNotifications();
  }, [currentUser?.pi_uid]);

  useScrollablePagination({
    containerRef: scrollContainerRef,
    loadMoreRef,
    fetchNextPage: async () => {
      setLoading(true);
      await fetchNotifications();
    },
    hasMore,
    isLoading,
  });
  
  return (
    <div className="w-full md:w-[500px] md:mx-auto p-4">
      <div className="text-center mb-7">
        <h1 className="font-bold text-lg md:text-2xl">
          {t('SCREEN.NOTIFICATIONS.NOTIFICATIONS_HEADER')}
        </h1>
      </div>

      {/* Notifications */}
      <div
        ref={scrollContainerRef}
        id="notification-scroll-container"
        className="max-h-[600px] overflow-y-auto p-1 mb-7 mt-3"
      >
        {!isLoading && hasFetched && notifications.length === 0 ? (
          <h2 className="font-bold mb-2 text-center">
            {t('SCREEN.NOTIFICATIONS.NO_NOTIFICATIONS_SUBHEADER')}
          </h2>
        ) : (
          notifications.map((notify, index) => (
            <NotificationCard
              key={notify._id}
              notification={notify}
              onToggleClear={handleUpdateNotification}
              refCallback={handleShopItemRef} // Attach observer
            />
          ))
        )}
        
        {/* Load more trigger */}
        {isLoading && <Skeleton type="notification" />}
        <div ref={loadMoreRef} className="h-[20px]" />        
      </div>
    </div>
  );
}
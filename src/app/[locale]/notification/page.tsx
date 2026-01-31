'use client';

import { useTranslations } from 'next-intl';
import React, { useContext, useEffect } from 'react';
import NotificationCard from '@/components/shared/Notification/NotificationCard';
import Skeleton from '@/components/skeleton/skeleton';
import { NotificationType } from '@/constants/types';
import { usePagination } from '@/hooks/usePagination'; // Using the new high-performance hook
import { getNotifications, updateNotification } from '@/services/notificationApi';
import { AppContext } from '../../../../context/AppContextProvider';
import logger from '../../../../logger.config.mjs';

export default function NotificationPage() {
  const t = useTranslations();
  const { currentUser, setNotificationsCount } = useContext(AppContext);

  /**
   * Initialize the standardized pagination hook.
   * This handles fetching, page tracking, and viewport detection automatically.
   */
  const { 
    data: notifications, 
    loading: isLoading, 
    lastElementRef, 
    hasNextPage,
    setData: setNotifications 
  } = usePagination<NotificationType>(
    (page, limit) => getNotifications(page, limit), 
    10 // Limit per page
  );

  /**
   * Handles the optimistic UI update for clearing notifications.
   * Maintains the existing Map-of-Pi logic but works with the new data state.
   */
  const handleUpdateNotification = async (id: string) => {
    const prev = notifications.find((n) => n._id === id);
    if (!prev) return;

    // Optimistic local update
    setNotifications((prevList) =>
      prevList.map((n) =>
        n._id === id ? { ...n, is_cleared: !n.is_cleared } : n
      )
    );

    if (!prev.is_cleared) {
      setNotificationsCount((c) => Math.max(0, c - 1));
    } else {
      setNotificationsCount((c) => c + 1);
    }

    try {
      await updateNotification(id);
      // Background sync for badges
      const response: any = await getNotifications(1, 1, 'uncleared');
      // Using totalDocs or count based on what the API returns
      setNotificationsCount(response?.totalDocs || response?.count || 0);
    } catch (error) {
      logger.error('Error updating notification:', error);
      // Rollback on failure
      setNotifications((prevList) =>
        prevList.map((n) =>
          n._id === id ? { ...n, is_cleared: prev.is_cleared } : n
        )
      );
    }
  };

  return (
    <div className="w-full md:w-[500px] md:mx-auto p-4">
      <div className="text-center mb-7">
        <h1 className="font-bold text-lg md:text-2xl">
          {t('SCREEN.NOTIFICATIONS.NOTIFICATIONS_HEADER')}
        </h1>
      </div>

      {/* Notifications Scroll Container */}
      <div
        id="notification-scroll-container"
        className="max-h-[80vh] overflow-y-auto p-1 mb-7 mt-3 scrollbar-hide"
      >
        {notifications.length === 0 && !isLoading ? (
          <h2 className="font-bold mb-2 text-center">
            {t('SCREEN.NOTIFICATIONS.NO_NOTIFICATIONS_SUBHEADER')}
          </h2>
        ) : (
          notifications.map((notify, index) => {
            const isLastElement = index === notifications.length - 1;
            return (
              <NotificationCard
                key={notify._id}
                notification={notify}
                onToggleClear={handleUpdateNotification}
                /* FIX: Passing an empty arrow function instead of undefined 
                   to satisfy TypeScript strict type checking for the refCallback prop.
                */
                refCallback={isLastElement ? lastElementRef : (() => {})}
              />
            );
          })
        )}
        
        {/* Loading Indicators */}
        {isLoading && (
          <div className="space-y-4 mt-4">
            <Skeleton type="notification" />
            <Skeleton type="notification" />
          </div>
        )}

        {!hasNextPage && notifications.length > 0 && (
          <p className="text-center text-gray-500 text-sm mt-4">
            {t('COMMON.END_OF_LIST')}
          </p>
        )}
      </div>
    </div>
  );
}

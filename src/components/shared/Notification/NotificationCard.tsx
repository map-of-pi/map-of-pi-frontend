'use client';

import React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/shared/Forms/Buttons/Buttons';
import { Input } from '@/components/shared/Forms/Inputs/Inputs';
import { NotificationType } from '@/constants/types';
import { resolveDate } from '@/utils/date';

type NotificationCardProps = {
  notification: NotificationType;
  onToggleClear: (id: string) => void;
  refCallback: (node: HTMLElement | null) => void;
};

export default function NotificationCard({
  notification,
  onToggleClear,
  refCallback,
}: NotificationCardProps) {
  const t = useTranslations();
  const locale = useLocale();

  const { date, time } = resolveDate(notification.createdAt, locale);

  return (
    <div
      ref={refCallback}
      data-id={notification._id}
      className={`relative outline outline-50 outline-gray-600 rounded-lg mb-7
        transition-all duration-150 ease-in-out transform
        ${notification.is_cleared ? 'bg-yellow-100' : ''}
        translate-x-0 opacity-100`}
    >
      <div className="p-3">
        <div className="mb-3">
          <Input
            label={`${t('SCREEN.NOTIFICATIONS.NOTIFICATION_SECTION.NOTIFICATION_LABEL')}:`}
            name="reason"
            type="text"
            value={notification.reason}
            disabled
          />
        </div>

        <div className="flex gap-x-4">
          <div className="flex-auto w-64">
            <Input
              label={`${t('SCREEN.NOTIFICATIONS.NOTIFICATION_SECTION.NOTIFICATION_TIME_LABEL')}:`}
              name="createdAt"
              type="text"
              value={`${date}, ${time}`}
              disabled
            />
          </div>

          <div className="flex-auto w-32">
            <div className="flex-auto w-full flex items-end pt-[30px]">
              <Button
                label={
                  notification.is_cleared
                    ? t('SCREEN.NOTIFICATIONS.NOTIFICATION_SECTION.NOTIFICATION_STATUS.UNREAD')
                    : t('SCREEN.NOTIFICATIONS.NOTIFICATION_SECTION.NOTIFICATION_STATUS.READ')
                }
                styles={{ color: '#ffc153', width: '100%', height: '47px' }}
                onClick={() => onToggleClear(notification._id)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
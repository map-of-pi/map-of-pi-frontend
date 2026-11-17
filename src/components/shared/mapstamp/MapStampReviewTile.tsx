'use client';

import { useTranslations } from 'next-intl';
import React from 'react';
import { MapStampReviewVariant } from '@/utils/mapstamp';
import MapStampBadge from './MapStampBadge';

interface MapStampReviewTileProps {
  variant: MapStampReviewVariant;
  confirmed: boolean;
  disabled?: boolean;
  onConfirmChange: (confirmed: boolean) => void;
  onNotifyIssuer: () => void;
  onTopUp: () => void;
}

function MapStampReviewTile({
  variant,
  confirmed,
  disabled,
  onConfirmChange,
  onNotifyIssuer,
  onTopUp,
}: MapStampReviewTileProps) {
  const t = useTranslations('SHARED.MAPSTAMP');

  const secondaryBtnClass =
    'mt-2 mx-auto block px-8 py-1 rounded-full border-2 border-primary text-primary bg-transparent disabled:opacity-50';
  const textClass = 'pr-10 text-gray-500';

  return (
    <div className="relative rounded-md border border-gray-300 p-2 text-[14px]">
      <div className="absolute top-2 right-2">
        <MapStampBadge isActive size={30} />
      </div>
      <p className="pr-10">{t('REVIEW_TILE_HEADER')}</p>

      {variant === 1 && (
        <>
          <p className={textClass}>{t('NOT_OPTED_IN')}</p>
          <p className={`mt-2 ${textClass}`}>{t('NOT_OPTED_IN_HINT')}</p>
        </>
      )}

      {variant === 2 && (
        <>
          <p className={textClass}>{t('MEMBERSHIP_LAPSED')}</p>
          <button type="button" onClick={onNotifyIssuer} disabled={disabled} className={secondaryBtnClass}>
            {t('NOTIFY_ISSUER')}
          </button>
        </>
      )}

      {variant === 3 && (
        <>
          <p className={textClass}>{t('NO_MAPPI')}</p>
          <button type="button" onClick={onTopUp} disabled={disabled} className={secondaryBtnClass}>
            {t('TOP_UP')}
          </button>
        </>
      )}

      {variant === 4 && (
        <label className="block cursor-pointer">
          <span className={`block ${textClass}`}>{t('CONFIRM_MAPPI')}</span>
          <input
            type="checkbox"
            checked={confirmed}
            disabled={disabled}
            onChange={(e) => onConfirmChange(e.target.checked)}
            className="mt-2 mx-auto block h-6 w-6 accent-primary"
          />
        </label>
      )}
    </div>
  );
}

export default MapStampReviewTile;

'use client';

import { useId } from 'react';
import { createPortal } from 'react-dom';
import { IoMdClose } from 'react-icons/io';
import { useTranslations } from 'next-intl';

interface TrustProtectInsufficientMappiDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TrustProtectInsufficientMappiDialog = ({
  isOpen,
  onClose,
}: TrustProtectInsufficientMappiDialogProps) => {
  const t = useTranslations();
  const messageId = useId();

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={messageId}
        className="relative w-[260px] max-w-[85vw] rounded-[14px] bg-white p-6 shadow-lg"
      >
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute right-3 top-3 text-gray-600 hover:text-gray-800"
        >
          <IoMdClose aria-hidden="true" size={24} />
        </button>
        <div className="mt-5 text-center">
          <p id={messageId} className="text-lg">
            {t('SCREEN.REVIEWS.VALIDATION.TRUST_PROTECT_INSUFFICIENT_MAPPI')}
          </p>
        </div>
      </div>
    </div>,
    document.body,
  );
};

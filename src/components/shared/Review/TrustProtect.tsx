'use client';

import { useEffect, useId, useRef, useState } from 'react';
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
  const [isMounted, setIsMounted] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const messageId = useId();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isMounted || !isOpen) return;

    previousFocusRef.current = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCloseRef.current();
      } else if (event.key === 'Tab') {
        event.preventDefault();
        closeButtonRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previousFocusRef.current?.focus();
    };
  }, [isMounted, isOpen]);

  if (!isMounted || !isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[550] flex items-center justify-center bg-transparent"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={messageId}
        className="relative w-[260px] max-w-[85vw] rounded-[14px] border border-black bg-white px-5 pb-5 pt-9 text-center text-sm shadow-lg"
      >
        <button
          ref={closeButtonRef}
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute right-3 top-3 text-gray-600 hover:text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <IoMdClose aria-hidden="true" size={24} />
        </button>
        <p id={messageId} className="m-0 leading-[1.4]">
          {t('SCREEN.REVIEWS.VALIDATION.TRUST_PROTECT_INSUFFICIENT_MAPPI')}
        </p>
      </div>
    </div>,
    document.body,
  );
};

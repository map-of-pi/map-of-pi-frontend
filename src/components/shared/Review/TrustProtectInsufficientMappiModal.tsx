'use client';
import { useTranslations } from 'next-intl';
import { CloseButton } from '@/components/shared/Forms/Buttons/Buttons';
import styles from './TrustProtectInsufficientMappiModal.module.css';

interface TrustProtectInsufficientMappiModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TrustProtectInsufficientMappiModal = ({
  isOpen,
  onClose,
}: TrustProtectInsufficientMappiModalProps) => {
  const t = useTranslations();

  if (!isOpen) return null;

  return (
    <div className={styles.container}>
      <div className={styles.backdrop} onClick={onClose} />
      <div className={styles.body} role="dialog" aria-modal="true">
        <CloseButton onClick={onClose} />
        <p className={styles.message}>
          {t('SCREEN.REVIEWS.VALIDATION.TRUST_PROTECT_INSUFFICIENT_MAPPI')}
        </p>
      </div>
    </div>
  );
};

export default TrustProtectInsufficientMappiModal;

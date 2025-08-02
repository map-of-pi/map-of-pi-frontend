import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import React from 'react';
import { IoMdClose } from 'react-icons/io';

function NotificationDialog({ setShowDialog, onClose, message, url } : any) {
  const t = useTranslations();
  const router = useRouter();

  const handleClicked = () => {
    router.push(url);
    setShowDialog(false);
  }

  const handleClose = () => {
    onClose?.();
    setShowDialog(false);
  }
 
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-6 sm:mx-auto relative">
        <button 
          onClick={handleClose} 
          className="absolute top-3 right-3"
        >
          <IoMdClose size={24} className="text-gray-600 hover:text-gray-800" />
        </button>
        <div className="text-center mt-5">
          <p className="text-lg mb-4">{message}</p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleClicked}
              className="px-4 py-2 bg-primary text-secondary text-xl rounded-md"
            >
              {t('SHARED.VIEW_NOTIFICATIONS')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotificationDialog;
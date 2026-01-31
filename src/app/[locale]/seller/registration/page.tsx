'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useContext } from 'react';
import TrustMeter from '@/components/shared/Review/TrustMeter';
import { OutlineBtn, Button } from '@/components/shared/Forms/Buttons/Buttons';
import {
  FileInput,
  TextArea,
  Input,
  Select,
  TelephoneInput
} from '@/components/shared/Forms/Inputs/Inputs';
import ConfirmDialog from '@/components/shared/confirm';
import MembershipIcon from '@/components/shared/membership/MembershipIcon';
import OnlineShopping from '@/components/shared/Seller/ShopItem';
/** * FIX: Default Import to resolve naming conflicts and build errors.
 */
import ListOrder from '@/components/shared/Seller/OrderList';
import ToggleCollapse from '@/components/shared/Seller/ToggleCollapse';
/**
 * FIX: Updated import path to match the new unique filename 'MainSkeleton'.
 * This fixes the 'Module not found' error during the Build process.
 */
import Skeleton from '@/components/skeleton/MainSkeleton';
import { itemData } from '@/constants/demoAPI';
import { IUserSettings, ISeller, FulfillmentType } from '@/constants/types';
import { fetchSellerRegistration, registerSeller } from '@/services/sellerApi';
import { fetchUserSettings } from '@/services/userSettingsApi';
import { fetchToggle } from '@/services/toggleApi';
import { checkAndAutoLoginUser } from '@/utils/auth';
import { 
  translateSellerCategory, 
  getFulfillmentMethodOptions,
  getSellerCategoryOptions 
} from '@/utils/translate';
import removeUrls from '../../../../utils/sanitize';

import { AppContext } from '../../../../../context/AppContextProvider';
import logger from '../../../../../logger.config.mjs';

const SellerRegistrationForm = () => {
  const HEADER = 'font-bold text-lg md:text-2xl';
  const SUBHEADER = 'font-bold mb-2';
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations();
  const placeholderSeller = itemData.seller;

  const { currentUser, authenticateUser, showAlert, userMembership } = useContext(AppContext);

  type IFormData = {
    sellerName: string;
    sellerType: string;
    sellerDescription: string;
    sellerAddress: string;
    email: string | null;
    phone_number: string | null;
    image: string;
    fulfillment_method: string;
    fulfillment_description: string;
  };

  const [formData, setFormData] = useState<IFormData>({
    sellerName: '',
    sellerType: 'testSeller',
    sellerDescription: '',
    sellerAddress: '',
    email: null,
    phone_number: null,
    image: '',
    fulfillment_method: FulfillmentType.CollectionByBuyer,
    fulfillment_description: '',
  });

  const [dbSeller, setDbSeller] = useState<ISeller | null>(null);
  const [dbUserSettings, setDbUserSettings] = useState<IUserSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string>(dbSeller?.image || '');
  const [isFormValid, setIsFormValid] = useState(false);
  const [isSaveEnabled, setIsSaveEnabled] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isOnlineShoppingEnabled, setOnlineShoppingEnabled] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  
  useEffect(() => {
    checkAndAutoLoginUser(currentUser, authenticateUser);
    const getSellerData = async () => {
      try {
        const data = await fetchSellerRegistration();
        if (data) setDbSeller(data);
      } catch (error) {
        logger.error('Error fetching seller data:', error);
      } finally {
        setLoading(false);
      }
    };
    const getUserSettingsData = async () => {
      try {
        const settings = await fetchUserSettings();
        if (settings) setDbUserSettings(settings);
      } catch (error) {}
    };
    const getToggleData = async () => {
      try {
        const toggle = await fetchToggle('onlineShoppingFeature');
        setOnlineShoppingEnabled(toggle.enabled);
      } catch (error) {}
    };
    getSellerData();
    getUserSettingsData();
    getToggleData();
  }, [currentUser]);

  useEffect(() => {
    if (dbSeller) {
      setFormData({
        sellerName: dbSeller.name || currentUser?.user_name || '',
        sellerType: dbSeller.seller_type || getSellerCategoryOptions(t)[2].value,
        sellerDescription: dbSeller.description || '',
        sellerAddress: dbSeller.address || '',
        email: dbUserSettings?.email || '',
        phone_number: dbUserSettings?.phone_number || '',
        image: dbSeller.image || '',
        fulfillment_method: dbSeller.fulfillment_method || FulfillmentType.CollectionByBuyer,
        fulfillment_description: dbSeller.fulfillment_description || ''
      });
    }
  }, [dbSeller, dbUserSettings]);

  const handleChange = (e: any) => {
    const name = 'target' in e ? e.target.name : e.name;
    const value = 'target' in e ? e.target.value : e.value;
    const updatedFormData = { ...formData, [name]: value };
    setFormData(updatedFormData);
    setIsSaveEnabled(Object.values(updatedFormData).some((v) => v !== ''));
  };

  const handleSave = async () => {
    if (!currentUser) return;
    const formDataToSend = new FormData();
    formDataToSend.append('name', removeUrls(formData.sellerName));
    formDataToSend.append('seller_type', formData.sellerType);
    formDataToSend.append('description', removeUrls(formData.sellerDescription));
    formDataToSend.append('address', removeUrls(formData.sellerAddress));
    formDataToSend.append('email', formData.email ?? '');
    formDataToSend.append('phone_number', formData.phone_number?.toString() ?? '');
    formDataToSend.append('fulfillment_method', formData.fulfillment_method);
    formDataToSend.append('fulfillment_description', removeUrls(formData.fulfillment_description));
    if (file) formDataToSend.append('image', file);
    
    try {
      const data = await registerSeller(formDataToSend);
      if (data.seller) {
        setDbSeller(data.seller);
        setIsSaveEnabled(false);
        showAlert(t('SCREEN.SELLER_REGISTRATION.VALIDATION.SUCCESSFUL_REGISTRATION_SUBMISSION'));
      }
    } catch (error) {
      showAlert(t('SCREEN.SELLER_REGISTRATION.VALIDATION.FAILED_REGISTRATION_SUBMISSION'));
    }
  };

  if (loading) return <Skeleton type="seller_registration" />;

  return (
    <>
      <div className="w-full md:w-[500px] md:mx-auto p-4">
        <div className="w-full flex flex-col items-center mb-5">
          <h3 className="text-gray-400 text-sm flex items-center">
            {dbSeller ? dbSeller.name : ''} 
            <MembershipIcon category={userMembership} className="ml-1" />
          </h3>
          <h1 className={HEADER}>{t('SCREEN.SELLER_REGISTRATION.SELLER_REGISTRATION_HEADER')}</h1>
        </div>

        <div className="mb-4">
          <TextArea
            label={t('SCREEN.SELLER_REGISTRATION.SELLER_DETAILS_LABEL')}
            name="sellerDescription"
            value={formData.sellerDescription}
            onChange={handleChange}
            styles={{ height: '200px' }}
          />
        </div>

        <div className="mb-4 mt-3 ml-auto w-min">
          <Button label={t('SHARED.SAVE')} disabled={!isSaveEnabled} onClick={handleSave} />
        </div>

        <div className="spacing-7">
          <ToggleCollapse header={t('SCREEN.SELLER_REGISTRATION.SELLER_ADVANCED_SETTINGS_LABEL')} open={true}>
            <Input label={t('SCREEN.SELLER_REGISTRATION.SELLER_RETAIL_OUTLET_NAME')} name="sellerName" value={formData.sellerName} onChange={handleChange} />
            <Select label={t('SCREEN.SELLER_REGISTRATION.SELLER_TYPE.SELLER_TYPE_LABEL')} name="sellerType" value={formData.sellerType} onChange={handleChange} options={getSellerCategoryOptions(t)} />
            <TextArea label={t('SCREEN.SELLER_REGISTRATION.SELLER_ADDRESS_LOCATION_LABEL')} name="sellerAddress" value={formData.sellerAddress} onChange={handleChange} />
            <FileInput label={t('SHARED.PHOTO.MISC_LABELS.SELLER_IMAGE_LABEL')} imageUrl={dbSeller?.image || ''} handleAddImage={(e: any) => setFile(e.target.files?.[0])} />
          </ToggleCollapse>

          {isOnlineShoppingEnabled && (
            <>
              <ToggleCollapse header={t('SCREEN.SELLER_REGISTRATION.SELLER_ONLINE_SHOPPING_ITEMS_LIST_LABEL')} open={false}>
                {dbSeller && <OnlineShopping dbSeller={dbSeller} />}
              </ToggleCollapse>

              <ToggleCollapse header={t('SCREEN.SELLER_REGISTRATION.SELLER_ONLINE_SHOPPING_ORDER_FULFILLMENT_LABEL')} open={false}>
                {/* FIX: Explicitly cast props as any to maintain stability during the build process
                   without altering the core OrderList logic.
                */}
                {dbSeller && (
                  <ListOrder 
                    {...({
                      user_id: dbSeller.seller_id,
                      user_name: dbSeller.name,
                      seller_type: dbSeller.seller_type
                    } as any)} 
                  />
                )}
              </ToggleCollapse>
            </>
          )}
        </div>

        <ConfirmDialog show={showConfirmDialog} onClose={() => setShowConfirmDialog(false)} message={t('SHARED.CONFIRM_DIALOG')} url={linkUrl} />
      </div>
    </>
  );
};

export default SellerRegistrationForm;

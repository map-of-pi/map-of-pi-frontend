'use client';

import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';

import React, { useEffect, useState, useContext, useRef } from 'react';

import ConfirmDialog, { Notification } from '@/components/shared/confirm';
import { Button, CopyButton, OutlineBtn } from '@/components/shared/Forms/Buttons/Buttons';
import { Select, TextArea } from '@/components/shared/Forms/Inputs/Inputs';
import MembershipIcon from '@/components/shared/membership/MembershipIcon';
import TrustMeter from '@/components/shared/Review/TrustMeter';
import { ListItem } from '@/components/shared/Seller/ShopItem';
import ToggleCollapse from '@/components/shared/Seller/ToggleCollapse';
import Skeleton from '@/components/skeleton/skeleton';
import {
  ISeller,
  IUserSettings,
  IUser,
  SellerItem,
  PickedItems,
  MembershipClassType,
  StockLevelType,
  OrderStatusType,
} from '@/constants/types';
import { createAndUpdateOrder } from '@/services/orderApi';
import { fetchSellerItems, fetchSingleSeller } from '@/services/sellerApi';
import { fetchSingleUserSettings } from '@/services/userSettingsApi';
import { fetchToggle } from '@/services/toggleApi';
import { checkAndAutoLoginUser } from '@/utils/auth';
import {
  getFulfillmentMethodOptions,
  translateSellerCategory,
} from '@/utils/translate';

import { AppContext } from '../../../../../../context/AppContextProvider';
import logger from '../../../../../../logger.config.mjs';

export default function BuyFromSellerForm({
  params,
}: {
  params: { id: string };
}) {
  const SUBHEADER = 'font-bold mb-2';
  const t = useTranslations();
  const locale = useLocale();
  const sellerId = params.id;

  const {
    currentUser,
    autoLoginUser,
    reload,
    setReload,
    showAlert
  } = useContext(AppContext);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [sellerShopInfo, setSellerShopInfo] = useState<ISeller | null>(null);
  const [sellerSettings, setSellerSettings] = useState<IUserSettings | null>(null);
  const [sellerInfo, setSellerInfo] = useState<IUser | null>(null);
  const [sellerMembership, setSellerMembership] = useState<MembershipClassType>(MembershipClassType.CASUAL);
  const [dbSellerItems, setDbSellerItems] = useState<SellerItem[] | null>(null)
  const [totalAmount, setTotalAmount] = useState<number>(0.00);
  const [buyerDescription, setBuyerDescription] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pickedItems, setPickedItems] = useState<PickedItems[]>([]);
  const [isOnlineShoppingEnabled, setOnlineShoppingEnabled] = useState(false);
  const [showCheckoutStatus, setShowCheckoutStatus] = useState(false);
  const [checkoutStatusMessage, setCheckoutStatusMessage] = useState<string>('');

  const observer = useRef<IntersectionObserver | null>(null);

  const handleShopItemRef = (node: HTMLElement | null) => {
    if (node && observer.current) {
      observer.current.observe(node);
    }
  };

  useEffect(() => {
    checkAndAutoLoginUser(currentUser, autoLoginUser);

    const getSellerData = async () => {
      try {
        logger.info(`Fetching seller data for seller ID: ${sellerId}`);
        const data = await fetchSingleSeller(sellerId);
        setSellerShopInfo(data.sellerShopInfo);
        setSellerSettings(data.sellerSettings);
        setSellerInfo(data.sellerInfo);
        setSellerMembership(data.sellerMembership);

        if (data.sellerShopInfo) {
          logger.info(`Fetched seller shop info successfully for seller ID: ${sellerId}`);
        } else {
          logger.warn(`No seller shop info found for seller ID: ${sellerId}`);
        }
      } catch (error) {
        logger.error(`Error fetching seller data for seller ID: ${sellerId}`, error);
        setError('Error fetching seller data');
      } finally {
        setLoading(false);
      }
    };

    const getSellerSettings = async () => {
      try {
        logger.info(`Fetching seller settings for seller ID: ${sellerId}`);
        const settings = await fetchSingleUserSettings(sellerId);

        if (settings) {
          logger.info(`Fetched seller settings successfully for seller ID: ${sellerId}`);
        } else {
          logger.warn(`No seller settings found for seller ID: ${sellerId}`);
        }
      } catch (error) {
        logger.error(`Error fetching seller settings for seller ID: ${sellerId}`, error);
        setError('Error fetching seller settings');
      }
    };

    const getToggleData = async () => {
      try {
        const toggle = await fetchToggle('onlineShoppingFeature');
        setOnlineShoppingEnabled(toggle.enabled);
      } catch (error) {
        logger.error('Error fetching toggle:', error);
      }
    };

    getSellerData();
    getSellerSettings();
    getToggleData();
  }, []);

  useEffect(() => {
    const getSellerItems = async () => {
      if (!sellerShopInfo) return;

      try {
        const items: SellerItem[] = await fetchSellerItems(sellerShopInfo.seller_id);
        setDbSellerItems(items.map((item) => ({ ...item })) || null);
        logger.error('Error fetching seller items data:', error);
      } finally {
        if (reload) setReload(false); // Only reset reload if it was triggered
      }
    };

    getSellerItems();
  }, [sellerShopInfo, reload]);

  const onOrderComplete = (data: any) => {
    logger.info('Order placed successfully:', data.message);
    showAlert('Order placed successfully');
    setCheckoutStatusMessage(t('SCREEN.BUY_FROM_SELLER.ORDER_SUCCESSFUL_MESSAGE'));
    setShowCheckoutStatus(true);
    setPickedItems([]);
    setReload(true);
    setTotalAmount(0);
    setBuyerDescription('');
  };

  const onOrderError = (error: Error) => {
    logger.error('Error creating new order', error.message);
    setCheckoutStatusMessage(t('SCREEN.BUY_FROM_SELLER.ORDER_FAILED_OR_MAPPI_REQUIRED_MESSAGE'));
    setShowCheckoutStatus(true);
  };

  const checkoutOrder = async () => {
    if (!currentUser?.pi_uid) {
      return setError('User not logged in for payment');
    }

    const newOrderData = {
      sellerPiUid: sellerId,
      paymentId: null,
      totalAmount: totalAmount,
      status: OrderStatusType.Pending,
      fulfillmentMethod: sellerShopInfo?.fulfillment_method,
      sellerFulfillmentDescription: sellerShopInfo?.fulfillment_description,
      buyerFulfillmentDescription: buyerDescription,
    };

    try {
      const newOrder = await createAndUpdateOrder(newOrderData, pickedItems);
      if (newOrder && newOrder._id) {
        onOrderComplete(newOrder);
        setPickedItems([]);
      }
    } catch (error: any) {
      onOrderError(error);
    }
  };

  // loading condition
  if (loading) {
    logger.info('Loading seller data..');
    return <Skeleton type="seller_item" />;
  }

  return (
    <>
      <div className="w-full md:w-[500px] md:mx-auto p-4">
        <h1 className="mb-5 text-center font-bold text-lg md:text-2xl">
          {t('SCREEN.BUY_FROM_SELLER.BUY_FROM_SELLER_HEADER')}
        </h1>

        {sellerShopInfo && (
          <div>
            {/* Seller Profile */}
            <div className="flex gap-4 align-center mb-6 relative">
              <div className="rounded-[50%] w-[65px] h-[65px] relative">
                <Image
                  className="rounded-[50%]"
                  src={
                    sellerShopInfo.image && sellerShopInfo.image.trim() !== ''
                      ? sellerShopInfo.image
                      : 'images/logo.svg'
                  }
                  alt="seller logo"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  style={{
                    objectFit: 'contain',
                    maxHeight: '200px',
                    maxWidth: '100%',
                  }}
                />
              </div>
              <div className="my-auto">
                <h2 className="font-bold text-[18px] mb-2 flex items-center">
                  {sellerShopInfo.name}
                  <MembershipIcon
                    category={sellerMembership}
                    className="ml-1"
                    styleComponent={{
                      display: 'inline-block',
                      objectFit: 'contain',
                      verticalAlign: 'middle',
                    }}
                  />
                </h2>
                <p className="text-sm">
                  {translateSellerCategory(sellerShopInfo.seller_type, t)}
                </p>
              </div>
            </div>

            {/* Seller Details/Description */}
            <h2 className={SUBHEADER}>
              {t('SCREEN.BUY_FROM_SELLER.SELLER_DETAILS_LABEL')}
            </h2>
            <div className="seller_item_container">
              {/* Seller's description with line breaks */}
              <div className="seller-description-display">
                <p className="mb-5" style={{ whiteSpace: 'pre-wrap' }}>
                  {sellerShopInfo.description}
                </p>
              </div>
            </div>

            {/* Seller Address/ Position */}
            <h2 className={SUBHEADER}>
              {t('SCREEN.BUY_FROM_SELLER.SELLER_ADDRESS_POSITION_LABEL')}
            </h2>
            <div className="seller_item_container mb-5">
              <p className="mb-3" style={{ whiteSpace: 'pre-wrap' }}>
                {sellerShopInfo.address}
              </p>
            </div>

            {/* Summary of Reviews */}
            <div className="mb-7 mt-5">
              <h2 className={SUBHEADER}>
                {t('SCREEN.BUY_FROM_SELLER.REVIEWS_SUMMARY_LABEL')}
              </h2>
              {/* Trust-o-meter */}
              <div>
                <TrustMeter
                  ratings={
                    sellerSettings ? sellerSettings.trust_meter_rating : 100
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm">
                  {t('SCREEN.BUY_FROM_SELLER.REVIEWS_SCORE_MESSAGE', {
                    seller_review_rating:
                      sellerShopInfo.average_rating.$numberDecimal,
                  })}
                </p>
                <Link
                  href={`/${locale}/seller/reviews/${sellerId}?buyer=true&user_name=${sellerInfo?.pi_username}`}>
                  <OutlineBtn label={t('SHARED.CHECK_REVIEWS')} />
                </Link>
              </div>
            </div>

            {/* Online Shopping */}
            {isOnlineShoppingEnabled && (
              <ToggleCollapse
                header={t(
                  'SCREEN.SELLER_REGISTRATION.SELLER_ONLINE_SHOPPING_ITEMS_LIST_LABEL',
                )}
                open={false}>
                <div className="overflow-x-auto mb-7 mt-3 flex p-2 gap-x-5 w-full">
                  {dbSellerItems &&
                    dbSellerItems.length > 0 &&
                    dbSellerItems
                      .filter((item) => {
                        const isSold = item.stock_level === StockLevelType.sold;
                        const isExpired =
                          item.expired_by &&
                          new Date(item.expired_by) < new Date();
                        return !isSold && !isExpired;
                      })
                      .map((item) => (
                        <ListItem
                          key={item._id}
                          item={item}
                          pickedItems={pickedItems}
                          setPickedItems={setPickedItems}
                          refCallback={handleShopItemRef}
                          totalAmount={totalAmount}
                          setTotalAmount={setTotalAmount}
                        />
                      ))}
                </div>
                <div>
                  <h2 className={SUBHEADER}>
                    {t(
                      'SCREEN.SELLER_REGISTRATION.FULFILLMENT_METHOD_TYPE.FULFILLMENT_METHOD_TYPE_LABEL',
                    )}
                  </h2>
                  <Select
                    name="fulfillment_method"
                    options={getFulfillmentMethodOptions(t)}
                    value={sellerShopInfo.fulfillment_method}
                    disabled={true}
                  />
                  <h2 className={SUBHEADER}>
                    {t(
                      'SCREEN.SELLER_REGISTRATION.SELLER_TO_BUYER_FULFILLMENT_INSTRUCTIONS_LABEL',
                    )}
                  </h2>
                  <TextArea
                    name="fulfillment_description"
                    type="text"
                    value={sellerShopInfo.fulfillment_description}
                    disabled
                  />
                  <h2 className={SUBHEADER}>
                    {t(
                      'SCREEN.SELLER_REGISTRATION.BUYER_TO_SELLER_FULFILLMENT_DETAILS_LABEL',
                    )}
                  </h2>
                  <TextArea
                    name="buying_details"
                    value={buyerDescription}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setBuyerDescription(e.target.value)
                    }
                  />
                </div>
                <div className="mb-4 mt-3 ml-auto">
                  <Button
                    label={
                      t('SHARED.CHECKOUT') +
                      ` (${totalAmount.toFixed(3).toString()} π)`
                    }
                    disabled={!(pickedItems.length > 0)}
                    styles={{
                      color: '#ffc153',
                      height: '40px',
                      padding: '15px 20px',
                      marginLeft: 'auto',
                    }}
                    onClick={() => checkoutOrder()}
                  />
                </div>
                <div className="mb-4 mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className={SUBHEADER}>
                      {t('SCREEN.BUY_FROM_SELLER.MAKE_PAYMENT_TO_WALLET_ADDRESS_LABEL')}
                    </h2>

                    {/* Copy Button component*/}
                    <CopyButton textToCopy={sellerSettings?.wallet_address} />
                  </div>

                  <TextArea
                    placeholder={t('SCREEN.BUY_FROM_SELLER.PAYMENT_TO_WALLET_NOT_PROVIDED_MESSAGE')}
                    name="wallet_address"
                    type="text"
                    value={sellerSettings?.wallet_address?.trim() || ''}
                    readOnly
                  />
                </div>
              </ToggleCollapse>
            )}

            <ToggleCollapse
              header={t('SCREEN.BUY_FROM_SELLER.SELLER_CONTACT_DETAILS_LABEL')}>
              <div className="text-sm mb-3">
                <span className="font-bold">
                  {t('SHARED.USER_INFORMATION.PI_USERNAME_LABEL') + ': '}
                </span>
                <span>{sellerInfo ? sellerInfo.pi_username : ''}</span>
              </div>
              <div className="text-sm mb-3">
                <span className="font-bold">
                  {t('SHARED.USER_INFORMATION.NAME_LABEL') + ': '}
                </span>
                <span>{sellerInfo ? sellerInfo.user_name : ''}</span>
              </div>
              <div className="text-sm mb-3">
                <span className="font-bold">
                  {t('SHARED.USER_INFORMATION.PHONE_NUMBER_LABEL') + ': '}
                </span>
                <span>{sellerSettings ? sellerSettings.phone_number : ''}</span>
              </div>
              <div className="text-sm mb-3">
                <span className="font-bold">
                  {t('SHARED.USER_INFORMATION.EMAIL_LABEL') + ': '}
                </span>
                <span>{sellerSettings ? sellerSettings.email : ''}</span>
              </div>
            </ToggleCollapse>

            <ConfirmDialog
              show={showConfirmDialog}
              onClose={() => setShowConfirmDialog(false)}
              onConfirm={setShowConfirmDialog}
              message={t('SHARED.CONFIRM_DIALOG')}
              url={linkUrl}
            />

            {showCheckoutStatus && (
              <div className="fixed inset-0 flex items-center justify-center">
                <Notification
                  message={checkoutStatusMessage}
                  showDialog={showCheckoutStatus}
                  setShowDialog={setShowCheckoutStatus}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

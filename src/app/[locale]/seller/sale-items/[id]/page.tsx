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

/**
 * BuyFromSellerForm Component
 * Displays the seller's storefront, items, and facilitates the checkout process for buyers.
 * Enhanced with robust data validation and defensive rendering for high-volume stores.
 */
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
    authenticateUser,
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

  /**
   * Ref callback to observe shop items for performance optimizations or lazy loading.
   */
  const handleShopItemRef = (node: HTMLElement | null) => {
    if (node && observer.current) {
      observer.current.observe(node);
    }
  };

  /**
   * Initial effect to fetch seller profile data, settings, and feature toggles.
   * Leverages the 60s global timeout for reliable store rendering.
   */
  useEffect(() => {
    checkAndAutoLoginUser(currentUser, authenticateUser);

    const getSellerData = async () => {
      try {
        logger.info(`Fetching comprehensive seller data for ID: ${sellerId}`);
        const data = await fetchSingleSeller(sellerId);
        
        if (data) {
          setSellerShopInfo(data.sellerShopInfo || null);
          setSellerSettings(data.sellerSettings || null);
          setSellerInfo(data.sellerInfo || null);
          setSellerMembership(data.sellerMembership || MembershipClassType.CASUAL);
        }
      } catch (err) {
        logger.error(`Critical failure fetching seller data for ${sellerId}:`, err);
        setError('Error fetching seller data');
      } finally {
        setLoading(false);
      }
    };

    const getToggleData = async () => {
      try {
        const toggle = await fetchToggle('onlineShoppingFeature');
        setOnlineShoppingEnabled(toggle?.enabled || false);
      } catch (err) {
        logger.error('Error fetching online shopping toggle:', err);
      }
    };

    getSellerData();
    getToggleData();
  }, [sellerId, currentUser, authenticateUser]);

  /**
   * Effect hook to fetch available items from the seller's inventory.
   * Triggered when sellerShopInfo is resolved or on manual reload.
   */
  useEffect(() => {
    const getSellerItems = async () => {
      if (!sellerShopInfo?.seller_id) return;

      try {
        logger.info(`Fetching inventory for Seller ID: ${sellerShopInfo.seller_id}`);
        const items: SellerItem[] = await fetchSellerItems(sellerShopInfo.seller_id);
        setDbSellerItems(items ? items.map(item => ({ ...item })) : []);
      } catch (err) {
        logger.error('Failed to retrieve seller items inventory:', err);
      } finally {
        if (reload) setReload(false);
      }
    };

    getSellerItems();
  }, [sellerShopInfo, reload, setReload]);

  /**
   * Success handler for order placement.
   */
  const onOrderComplete = (data: any) => {
    logger.info('Checkout transaction finalized:', data._id);
    showAlert(t('SCREEN.BUY_FROM_SELLER.ORDER_SUCCESSFUL_MESSAGE'));
    setCheckoutStatusMessage(t('SCREEN.BUY_FROM_SELLER.ORDER_SUCCESSFUL_MESSAGE'));
    setShowCheckoutStatus(true);
    setPickedItems([]);
    setTotalAmount(0);
    setBuyerDescription('');
    setReload(true);
  };

  /**
   * Error handler for order placement.
   */
  const onOrderError = (err: any) => {
    logger.error('Order creation failed:', err?.message);
    setCheckoutStatusMessage(t('SCREEN.BUY_FROM_SELLER.ORDER_FAILED_OR_MAPPI_REQUIRED_MESSAGE'));
    setShowCheckoutStatus(true);
  };

  /**
   * Orchestrates the checkout process by validating user auth and submitting the order payload.
   */
  const checkoutOrder = async () => {
    if (!currentUser?.pi_uid) {
      toast.error(t('SCREEN.REVIEWS.VALIDATION.LOGIN_REQUIRED'));
      return;
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
      logger.info(`Initiating order for seller ${sellerId} total: ${totalAmount} Pi`);
      const newOrder = await createAndUpdateOrder(newOrderData, pickedItems);
      if (newOrder && newOrder._id) {
        onOrderComplete(newOrder);
      }
    } catch (err: any) {
      onOrderError(err);
    }
  };

  // Standardized loading state with skeleton feedback
  if (loading) {
    logger.info('Rendering seller storefront skeleton...');
    return <Skeleton type="seller_item" />;
  }

  return (
    <div className="w-full md:w-[500px] md:mx-auto p-4 animate-fadeIn">
      <h1 className="mb-5 text-center font-bold text-lg md:text-2xl">
        {t('SCREEN.BUY_FROM_SELLER.BUY_FROM_SELLER_HEADER')}
      </h1>

      {sellerShopInfo && (
        <div>
          {/* Seller Profile Branding */}
          <div className="flex gap-4 align-center mb-6 relative">
            <div className="rounded-[50%] w-[65px] h-[65px] relative overflow-hidden border border-gray-100 shadow-sm">
              <Image
                className="rounded-[50%]"
                src={sellerShopInfo.image?.trim() ? sellerShopInfo.image : '/images/logo.svg'}
                alt="seller logo"
                fill
                sizes="65px"
                style={{ objectFit: 'contain' }}
              />
            </div>
            <div className="my-auto">
              <h2 className="font-bold text-[18px] mb-2 flex items-center">
                {sellerShopInfo.name}
                <MembershipIcon
                  category={sellerMembership}
                  className="ml-2"
                  styleComponent={{
                    display: 'inline-block',
                    objectFit: 'contain',
                    verticalAlign: 'middle',
                  }}
                />
              </h2>
              <p className="text-sm text-gray-500">
                {translateSellerCategory(sellerShopInfo.seller_type, t)}
              </p>
            </div>
          </div>

          {/* Business Description */}
          <h2 className={SUBHEADER}>
            {t('SCREEN.BUY_FROM_SELLER.SELLER_DETAILS_LABEL')}
          </h2>
          <div className="seller_item_container mb-6 bg-white p-4 rounded-lg">
            <div className="seller-description-display">
              <p style={{ whiteSpace: 'pre-wrap' }} className="text-[#4F4F4F] leading-relaxed">
                {sellerShopInfo.description || t('SHARED.NO_DESCRIPTION')}
              </p>
            </div>
          </div>

          {/* Location Details */}
          <h2 className={SUBHEADER}>
            {t('SCREEN.BUY_FROM_SELLER.SELLER_ADDRESS_POSITION_LABEL')}
          </h2>
          <div className="seller_item_container mb-7 bg-white p-4 rounded-lg">
            <p style={{ whiteSpace: 'pre-wrap' }} className="text-[#4F4F4F]">
              {sellerShopInfo.address || t('SHARED.ADDRESS_NOT_PROVIDED')}
            </p>
          </div>

          {/* Social Proof & Trust Metrics */}
          <div className="mb-7 mt-5">
            <h2 className={SUBHEADER}>
              {t('SCREEN.BUY_FROM_SELLER.REVIEWS_SUMMARY_LABEL')}
            </h2>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <TrustMeter
                ratings={sellerSettings?.trust_meter_rating ?? 100}
              />
              <div className="flex items-center justify-between mt-3">
                <p className="text-sm font-medium text-gray-600">
                  {t('SCREEN.BUY_FROM_SELLER.REVIEWS_SCORE_MESSAGE', {
                    seller_review_rating: sellerShopInfo.average_rating?.$numberDecimal?.toString() || "0.0",
                  })}
                </p>
                <Link
                  href={`/${locale}/seller/reviews/${sellerId}?buyer=true&user_name=${sellerInfo?.pi_username || ''}`}>
                  <OutlineBtn label={t('SHARED.CHECK_REVIEWS')} />
                </Link>
              </div>
            </div>
          </div>

          {/* Online Shopping Integration */}
          {isOnlineShoppingEnabled && (
            <ToggleCollapse
              header={t('SCREEN.SELLER_REGISTRATION.SELLER_ONLINE_SHOPPING_ITEMS_LIST_LABEL')}
              open={true}>
              <div className="overflow-x-auto mb-7 mt-3 flex p-2 gap-x-5 w-full scrollbar-hide">
                {dbSellerItems && dbSellerItems.length > 0 ? (
                  dbSellerItems
                    .filter((item) => {
                      const isSold = item.stock_level === StockLevelType.sold;
                      const isExpired = item.expired_by && new Date(item.expired_by) < new Date();
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
                    ))
                ) : (
                  <p className="text-gray-400 italic py-4">{t('SHARED.NO_ITEMS_AVAILABLE')}</p>
                )}
              </div>

              {/* Fulfillment Logic */}
              <div className="fulfillment-section space-y-4">
                <h2 className={SUBHEADER}>{t('SCREEN.SELLER_REGISTRATION.FULFILLMENT_METHOD_TYPE.FULFILLMENT_METHOD_TYPE_LABEL')}</h2>
                <Select
                  name="fulfillment_method"
                  options={getFulfillmentMethodOptions(t)}
                  value={sellerShopInfo.fulfillment_method || ""}
                  disabled={true}
                />

                <h2 className={SUBHEADER}>{t('SCREEN.SELLER_REGISTRATION.SELLER_TO_BUYER_FULFILLMENT_INSTRUCTIONS_LABEL')}</h2>
                <TextArea
                  name="fulfillment_description"
                  value={sellerShopInfo.fulfillment_description || ""}
                  disabled
                />

                <h2 className={SUBHEADER}>{t('SCREEN.SELLER_REGISTRATION.BUYER_TO_SELLER_FULFILLMENT_DETAILS_LABEL')}</h2>
                <TextArea
                  name="buying_details"
                  placeholder={t('SCREEN.BUY_FROM_SELLER.ENTER_FULFILLMENT_DETAILS_PLACEHOLDER')}
                  value={buyerDescription}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBuyerDescription(e.target.value)}
                />
              </div>

              {/* Checkout Action */}
              <div className="flex justify-end mt-6">
                <Button
                  label={`${t('SHARED.CHECKOUT')} (${totalAmount.toFixed(3)} π)`}
                  disabled={pickedItems.length === 0}
                  styles={{
                    color: '#ffc153',
                    height: '45px',
                    padding: '0 25px',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                  onClick={checkoutOrder}
                />
              </div>

              {/* Wallet Info */}
              <div className="mb-4 mt-8 pt-6 border-t border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <h2 className={SUBHEADER}>{t('SCREEN.BUY_FROM_SELLER.MAKE_PAYMENT_TO_WALLET_ADDRESS_LABEL')}</h2>
                  <CopyButton textToCopy={sellerSettings?.wallet_address} />
                </div>
                <TextArea
                  placeholder={t('SCREEN.BUY_FROM_SELLER.PAYMENT_TO_WALLET_NOT_PROVIDED_MESSAGE')}
                  name="wallet_address"
                  value={sellerSettings?.wallet_address?.trim() || ''}
                  readOnly
                />
              </div>
            </ToggleCollapse>
          )}

          {/* Seller Contact Accordion */}
          <ToggleCollapse header={t('SCREEN.BUY_FROM_SELLER.SELLER_CONTACT_DETAILS_LABEL')}>
            <div className="space-y-3 p-2">
              <div className="text-sm"><span className="font-bold">{t('SHARED.USER_INFORMATION.PI_USERNAME_LABEL')}:</span> {sellerInfo?.pi_username || ''}</div>
              <div className="text-sm"><span className="font-bold">{t('SHARED.USER_INFORMATION.NAME_LABEL')}:</span> {sellerInfo?.user_name || ''}</div>
              <div className="text-sm"><span className="font-bold">{t('SHARED.USER_INFORMATION.PHONE_NUMBER_LABEL')}:</span> {sellerSettings?.phone_number || ''}</div>
              <div className="text-sm"><span className="font-bold">{t('SHARED.USER_INFORMATION.EMAIL_LABEL')}:</span> {sellerSettings?.email || ''}</div>
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
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
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
  );
}

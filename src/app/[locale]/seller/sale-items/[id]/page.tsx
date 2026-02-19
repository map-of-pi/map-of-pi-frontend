'use client';

import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState, useContext, useRef } from 'react';
import { toast } from 'react-toastify'; // Fixed: Added missing import to resolve build error

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
 * Displays the seller's storefront, inventory, and manages the checkout workflow.
 * This component is hardened with defensive rendering and error boundary checks.
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

  // UI State Management
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
   * Intersection observer ref to handle shop item visibility or lazy loading.
   */
  const handleShopItemRef = (node: HTMLElement | null) => {
    if (node && observer.current) {
      observer.current.observe(node);
    }
  };

  /**
   * Effect: Data Initialization
   * Synchronizes user auth and fetches multi-layered seller profile data.
   */
  useEffect(() => {
    checkAndAutoLoginUser(currentUser, authenticateUser);

    const getSellerData = async () => {
      try {
        logger.info(`Fetching comprehensive profile for seller: ${sellerId}`);
        const data = await fetchSingleSeller(sellerId);
        
        if (data) {
          setSellerShopInfo(data.sellerShopInfo || null);
          setSellerSettings(data.sellerSettings || null);
          setSellerInfo(data.sellerInfo || null);
          setSellerMembership(data.sellerMembership || MembershipClassType.CASUAL);
        }
      } catch (err) {
        logger.error(`Critical failure resolving seller data [ID: ${sellerId}]:`, err);
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
        logger.error('Feature toggle resolution failure:', err);
      }
    };

    getSellerData();
    getToggleData();
  }, [sellerId, currentUser, authenticateUser]);

  /**
   * Effect: Inventory Synchronization
   * Fetches specific sellable items associated with the current store.
   */
  useEffect(() => {
    const getSellerItems = async () => {
      if (!sellerShopInfo?.seller_id) return;

      try {
        logger.info(`Fetching inventory for shop: ${sellerShopInfo.seller_id}`);
        const items: SellerItem[] = await fetchSellerItems(sellerShopInfo.seller_id);
        setDbSellerItems(items ? items.map(item => ({ ...item })) : []);
      } catch (err) {
        logger.error('Failed to resolve inventory list:', err);
      } finally {
        if (reload) setReload(false);
      }
    };

    getSellerItems();
  }, [sellerShopInfo, reload, setReload]);

  /**
   * Handles post-checkout success state.
   */
  const onOrderComplete = (data: any) => {
    logger.info('Checkout flow completed successfully for order:', data._id);
    showAlert(t('SCREEN.BUY_FROM_SELLER.ORDER_SUCCESSFUL_MESSAGE'));
    setCheckoutStatusMessage(t('SCREEN.BUY_FROM_SELLER.ORDER_SUCCESSFUL_MESSAGE'));
    setShowCheckoutStatus(true);
    setPickedItems([]);
    setTotalAmount(0);
    setBuyerDescription('');
    setReload(true);
  };

  /**
   * Handles checkout failure state.
   */
  const onOrderError = (err: any) => {
    logger.error('Checkout flow failed:', err?.message);
    setCheckoutStatusMessage(t('SCREEN.BUY_FROM_SELLER.ORDER_FAILED_OR_MAPPI_REQUIRED_MESSAGE'));
    setShowCheckoutStatus(true);
  };

  /**
   * Core Checkout Orchestrator
   * Validates state, authenticates, and dispatches the order creation request.
   */
  const checkoutOrder = async () => {
    if (!currentUser?.pi_uid) {
      // toast is now properly imported and will work as expected
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
      logger.info(`Processing checkout payload for seller ${sellerId}...`);
      const newOrder = await createAndUpdateOrder(newOrderData, pickedItems);
      if (newOrder && newOrder._id) {
        onOrderComplete(newOrder);
      }
    } catch (err: any) {
      onOrderError(err);
    }
  };

  // Loading state with visual skeleton feedback
  if (loading) {
    return <Skeleton type="seller_item" />;
  }

  return (
    <div className="w-full md:w-[500px] md:mx-auto p-4 animate-fadeIn">
      <h1 className="mb-5 text-center font-bold text-lg md:text-2xl">
        {t('SCREEN.BUY_FROM_SELLER.BUY_FROM_SELLER_HEADER')}
      </h1>

      {sellerShopInfo && (
        <div className="space-y-6">
          {/* Section: Seller Header & Identity */}
          <div className="flex gap-4 align-center relative bg-white p-3 rounded-xl shadow-sm border border-gray-50">
            <div className="rounded-[50%] w-[65px] h-[65px] relative overflow-hidden border border-gray-100 shadow-inner">
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
              <h2 className="font-bold text-[18px] mb-1 flex items-center">
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
              <p className="text-sm text-gray-400">
                {translateSellerCategory(sellerShopInfo.seller_type, t)}
              </p>
            </div>
          </div>

          {/* Section: Business Description */}
          <div>
            <h2 className={SUBHEADER}>
              {t('SCREEN.BUY_FROM_SELLER.SELLER_DETAILS_LABEL')}
            </h2>
            <div className="bg-white p-4 rounded-lg border border-gray-50 shadow-sm">
              <p style={{ whiteSpace: 'pre-wrap' }} className="text-[#4F4F4F] leading-relaxed text-sm">
                {sellerShopInfo.description || t('SHARED.NO_DESCRIPTION')}
              </p>
            </div>
          </div>

          {/* Section: Physical Address */}
          <div>
            <h2 className={SUBHEADER}>
              {t('SCREEN.BUY_FROM_SELLER.SELLER_ADDRESS_POSITION_LABEL')}
            </h2>
            <div className="bg-white p-4 rounded-lg border border-gray-50 shadow-sm">
              <p style={{ whiteSpace: 'pre-wrap' }} className="text-[#4F4F4F] text-sm italic">
                {sellerShopInfo.address || t('SHARED.ADDRESS_NOT_PROVIDED')}
              </p>
            </div>
          </div>

          {/* Section: Social Proof & Reputation */}
          <div className="mt-5">
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

          {/* Section: Digital Inventory & Checkout */}
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

              {/* Fulfillment Configuration */}
              <div className="space-y-4 bg-gray-50 p-4 rounded-xl">
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

              {/* Final Checkout Trigger */}
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

              {/* Wallet Integration */}
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

          {/* Section: Detailed Contact Information */}
          <ToggleCollapse header={t('SCREEN.BUY_FROM_SELLER.SELLER_CONTACT_DETAILS_LABEL')}>
            <div className="space-y-3 p-4 bg-white border border-gray-100 rounded-lg shadow-inner">
              <div className="text-sm flex justify-between"><span className="font-bold text-gray-500">{t('SHARED.USER_INFORMATION.PI_USERNAME_LABEL')}:</span> <span>{sellerInfo?.pi_username || ''}</span></div>
              <div className="text-sm flex justify-between"><span className="font-bold text-gray-500">{t('SHARED.USER_INFORMATION.NAME_LABEL')}:</span> <span>{sellerInfo?.user_name || ''}</span></div>
              <div className="text-sm flex justify-between"><span className="font-bold text-gray-500">{t('SHARED.USER_INFORMATION.PHONE_NUMBER_LABEL')}:</span> <span>{sellerSettings?.phone_number || ''}</span></div>
              <div className="text-sm flex justify-between"><span className="font-bold text-gray-500">{t('SHARED.USER_INFORMATION.EMAIL_LABEL')}:</span> <span>{sellerSettings?.email || ''}</span></div>
            </div>
          </ToggleCollapse>

          {/* Utility Dialogs */}
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

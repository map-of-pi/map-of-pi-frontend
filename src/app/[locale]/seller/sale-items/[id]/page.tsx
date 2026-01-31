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
/**
 * FIX: Updated import path to match the new unique filename 'MainSkeleton'.
 * This resolves the Webpack 'Module not found' error while preserving the existing UI flow.
 */
import Skeleton from '@/components/skeleton/MainSkeleton';
import {
  ISeller,
  IUserSettings,
  IUser,
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
import { usePagination } from '@/hooks/usePagination'; // Import our unified hook

import { AppContext } from '../../../../../../context/AppContextProvider';
import logger from '../../../../../../logger.config.mjs';

export default function BuyFromSellerForm({ params }: { params: { id: string } }) {
  const SUBHEADER = 'font-bold mb-2';
  const t = useTranslations();
  const locale = useLocale();
  const sellerId = params.id;

  const { currentUser, authenticateUser, reload, setReload, showAlert } = useContext(AppContext);

  const [sellerShopInfo, setSellerShopInfo] = useState<ISeller | null>(null);
  const [sellerSettings, setSellerSettings] = useState<IUserSettings | null>(null);
  const [sellerInfo, setSellerInfo] = useState<IUser | null>(null);
  const [sellerMembership, setSellerMembership] = useState<MembershipClassType>(MembershipClassType.CASUAL);
  const [totalAmount, setTotalAmount] = useState<number>(0.00);
  const [buyerDescription, setBuyerDescription] = useState<string>("");
  const [loadingProfile, setLoadingProfile] = useState<boolean>(true);
  const [pickedItems, setPickedItems] = useState<any[]>([]);
  const [isOnlineShoppingEnabled, setOnlineShoppingEnabled] = useState(false);
  const [showCheckoutStatus, setShowCheckoutStatus] = useState(false);
  const [checkoutStatusMessage, setCheckoutStatusMessage] = useState<string>('');

  /**
   * Safe Pagination for Seller Items.
   * Synchronized with our unified usePagination hook.
   * Map 'hasNextPage' to 'hasMore' to maintain existing JSX logic.
   */
  const {
    data: dbSellerItems,
    loading: loadingItems,
    hasNextPage: hasMore,
    lastElementRef
  } = usePagination<any>(
    (page, limit) => fetchSellerItems(sellerShopInfo?.seller_id as string, page, limit),
    10
  );

  useEffect(() => {
    checkAndAutoLoginUser(currentUser, authenticateUser);
    const getSellerInitialData = async () => {
      try {
        const data = await fetchSingleSeller(sellerId);
        setSellerShopInfo(data.sellerShopInfo);
        setSellerSettings(data.sellerSettings);
        setSellerInfo(data.sellerInfo);
        setSellerMembership(data.sellerMembership);
        
        const toggle = await fetchToggle('onlineShoppingFeature');
        setOnlineShoppingEnabled(toggle.enabled);
      } catch (error) {
        logger.error(`Error loading seller profile: ${sellerId}`, error);
      } finally {
        setLoadingProfile(false);
      }
    };
    getSellerInitialData();
  }, [sellerId]);

  // Existing Checkout Logic (Maintained for stability)
  const checkoutOrder = async () => {
    if (!currentUser?.pi_uid) return;
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
      if (newOrder) {
        showAlert('Order placed successfully');
        setCheckoutStatusMessage(t('SCREEN.BUY_FROM_SELLER.ORDER_SUCCESSFUL_MESSAGE'));
        setShowCheckoutStatus(true);
        setPickedItems([]);
        setTotalAmount(0);
      }
    } catch (error: any) {
      setCheckoutStatusMessage(t('SCREEN.BUY_FROM_SELLER.ORDER_FAILED_OR_MAPPI_REQUIRED_MESSAGE'));
      setShowCheckoutStatus(true);
    }
  };

  if (loadingProfile) return <Skeleton type="seller_item" />;

  return (
    <div className="w-full md:w-[500px] md:mx-auto p-4">
      {/* Seller Header Section */}
      {sellerShopInfo && (
        <>
          <div className="flex gap-4 align-center mb-6 relative">
             <div className="rounded-[50%] w-[65px] h-[65px] relative">
                <Image className="rounded-[50%]" src={sellerShopInfo.image || '/images/logo.svg'} alt="logo" fill style={{objectFit: 'contain'}} />
             </div>
             <div>
                <h2 className="font-bold text-[18px]">{sellerShopInfo.name} <MembershipIcon category={sellerMembership} /></h2>
                <p className="text-sm">{translateSellerCategory(sellerShopInfo.seller_type, t)}</p>
             </div>
          </div>

          {/* Online Shopping Section with Infinite Scroll */}
          {isOnlineShoppingEnabled && (
            <ToggleCollapse header={t('SCREEN.SELLER_REGISTRATION.SELLER_ONLINE_SHOPPING_ITEMS_LIST_LABEL')} open={true}>
              <div className="overflow-x-auto mb-7 mt-3 flex p-2 gap-x-5 w-full scrollbar-hide">
                {dbSellerItems.map((item, index) => {
                  const isLast = index === dbSellerItems.length - 1;
                  return (
                    <ListItem 
                      key={item._id} 
                      item={item} 
                      pickedItems={pickedItems} 
                      setPickedItems={setPickedItems} 
                      totalAmount={totalAmount} 
                      setTotalAmount={setTotalAmount} 
                      /* FIX: Passing the lastElementRef to refCallback as required by ListItem's props.
                         This triggers the next page fetch when the last item enters the viewport.
                      */
                      refCallback={isLast ? (lastElementRef as any) : (() => {})}
                    />
                  );
                })}
                
                {/* Loader for next page */}
                {loadingItems && (
                  <div className="min-w-[80px] flex items-center justify-center">
                    <div className="animate-spin text-primary text-2xl">🌀</div>
                  </div>
                )}
              </div>

              <div className="mb-4 mt-3 ml-auto">
                <Button 
                   label={`${t('SHARED.CHECKOUT')} (${totalAmount.toFixed(3)} π)`}
                   disabled={pickedItems.length === 0}
                   onClick={checkoutOrder}
                   styles={{ color: '#ffc153', marginLeft: 'auto' }}
                />
              </div>
            </ToggleCollapse>
          )}

          <ToggleCollapse header={t('SCREEN.BUY_FROM_SELLER.SELLER_CONTACT_DETAILS_LABEL')}>
             <p className="text-sm"><strong>{t('SHARED.USER_INFORMATION.PI_USERNAME_LABEL')}:</strong> {sellerInfo?.pi_username}</p>
          </ToggleCollapse>
        </>
      )}

      {showCheckoutStatus && (
        <Notification message={checkoutStatusMessage} showDialog={showCheckoutStatus} setShowDialog={setShowCheckoutStatus} />
      )}
    </div>
  );
}

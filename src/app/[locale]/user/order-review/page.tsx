'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import React, { useEffect, useState, useContext } from 'react';
import { Input } from '@/components/shared/Forms/Inputs/Inputs';
import Skeleton from '@/components/skeleton/skeleton';
import { PartialOrderType, OrderStatusType } from '@/constants/types';
import { fetchBuyerOrders } from '@/services/orderApi';
import { resolveDate } from '@/utils/date';
import { translateOrderStatusType } from '@/utils/translate';

import { AppContext } from '../../../../../context/AppContextProvider';
import logger from '../../../../../logger.config.mjs';

/**
 * OrderReviewPage Component
 * Renders a list of orders for the currently authenticated buyer.
 * Optimized with robust error handling and localized date/status resolution.
 */
export default function OrderReviewPage() {
  const locale = useLocale();
  const t = useTranslations();

  const HEADER = 'font-bold text-lg md:text-2xl';

  const { currentUser } = useContext(AppContext);
  const [loading, setLoading] = useState<boolean>(true);
  const [orderList, setOrderList] = useState<PartialOrderType[]>([]);
  
  /**
   * Fetches the buyer's order history from the backend.
   * Includes error boundaries to prevent UI crashes during server timeouts or empty responses.
   * @param id - The Pi UID of the current user.
   */
  useEffect(() => {
    const getOrderList = async (id: string) => {
      if (!id) return;
      
      setLoading(true);
      try {
        logger.info(`Fetching order list for buyer UID: ${id}`);
        const data = await fetchBuyerOrders(id);
        
        if (data && Array.isArray(data)) {
          setOrderList(data);
          logger.info(`Successfully retrieved ${data.length} orders.`);
        } else {
          setOrderList([]);
          logger.warn('No order data returned from the server.');
        }
      } catch (error) {
        // Handling potential 500/Timeout errors gracefully as per the bug report analysis
        logger.error('Critical error while fetching buyer order data:', error);
        setOrderList([]);
      } finally {
        setLoading(false);
      }
    };
    
    getOrderList(currentUser?.pi_uid as string);
  }, [currentUser?.pi_uid]);

  /**
   * Loading State - Displays the Skeleton UI while fetching data.
   * Consistent with the project's performance standards.
   */
  if (loading) {
    logger.info('Rendering loading skeleton for order history...');
    return (
      <Skeleton type="seller_review" />
    );
  }

  return (
    <>
      <div className="w-full md:w-[500px] md:mx-auto p-4">
        <div className="text-center mb-7">
          <h3 className="text-gray-400 text-sm">
            {currentUser?.user_name || ""}
          </h3>
          <h1 className={HEADER}>
            {t('SCREEN.SELLER_ORDER_FULFILLMENT.ORDER_LIST_HEADER')}
          </h1>
        </div>

        {/* Order List Container */}
        <div className="order-list-wrapper">
          {orderList && orderList.length > 0 ? (
            orderList.map((item, index) => (
              <Link 
                href={`/${locale}/user/order-item/${item._id}?user_name=${currentUser?.user_name}`} 
                key={item._id || index}
                className="block no-underline"
              > 
                <div
                  data-id={item._id}            
                  className={`relative outline outline-50 outline-gray-600 rounded-lg mb-7 transition-all hover:shadow-md
                    ${item.status === OrderStatusType.Completed ? 'bg-yellow-100' : 
                      item.status === OrderStatusType.Cancelled ? 'bg-red-100' : ''}`}
                >
                  <div className="p-3">
                    <div className="flex gap-x-4">
                      {/* Seller Information Field */}
                      <div className="flex-auto w-64">
                        <Input
                          label={t('SCREEN.SELLER_ORDER_FULFILLMENT.ORDER_HEADER_ITEMS_FEATURE.SELLER_LABEL') + ':'}
                          name="name"
                          type="text"
                          value={item.seller_id?.name || t('SHARED.UNKNOWN_SELLER')}
                          disabled={true}
                        />
                      </div>
            
                      {/* Total Amount Field */}
                      <div className="flex-auto w-32">
                        <div className="flex items-center gap-2">
                          <Input
                            label={t('SCREEN.SELLER_ORDER_FULFILLMENT.ORDER_HEADER_ITEMS_FEATURE.TOTAL_PRICE_LABEL') + ':'}
                            name="price"
                            type="text"
                            value={item.total_amount?.$numberDecimal?.toString() || "0"}
                            disabled={true}
                          />
                          <p className="text-gray-500 text-sm">π</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-x-4 w-full mt-1">
                      {/* Order Timestamp Field */}
                      <div className="flex-auto w-64">
                        <label className="block text-[17px] text-[#333333] mb-1">
                          {t('SCREEN.SELLER_ORDER_FULFILLMENT.ORDER_HEADER_ITEMS_FEATURE.TIME_OF_ORDER_LABEL') + ':'}
                        </label>
                        <div
                          className="p-[10px] block rounded-xl border-[#BDBDBD] bg-transparent outline-0 focus:border-[#1d724b] border-[2px] w-full mb-2"
                        >
                          {item?.createdAt ? (() => {
                            const { date, time } = resolveDate(item.createdAt, locale);
                            return (
                              <label className="text-[14px] text-[#333333]">
                                {date}, {time}
                              </label>
                            );
                          })() : t('SHARED.DATE_NOT_AVAILABLE')}
                        </div>
                      </div>

                      {/* Order Status Field */}
                      <div className="flex-auto w-32">
                        <Input
                          label={t('SCREEN.SELLER_ORDER_FULFILLMENT.ORDER_HEADER_ITEMS_FEATURE.STATUS_LABEL') + ':'}
                          name="status"
                          type="text"
                          value={translateOrderStatusType(item.status, t) || t('SCREEN.SELLER_ORDER_FULFILLMENT.STATUS_TYPE.PENDING')}
                          disabled={true}
                        />
                      </div>                 
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            /* Empty State Message */
            <div className="text-center py-10">
              <p className="text-gray-500">{t('SCREEN.SELLER_ORDER_FULFILLMENT.NO_ORDERS_FOUND')}</p>
            </div>
          )}      
        </div>
      </div>  
    </>
  );
}

'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import React, { useContext, useRef } from 'react';
import { Input } from '@/components/shared/Forms/Inputs/Inputs';
import Skeleton from '@/components/skeleton/skeleton';
import { OrderStatusType } from '@/constants/types';
import { fetchBuyerOrders } from '@/services/orderApi';
import { resolveDate } from '@/utils/date';
import { translateOrderStatusType } from '@/utils/translate';
import { usePagination } from '@/hooks/usePagination'; 

import { AppContext } from '../../../../../context/AppContextProvider';
import logger from '../../../../../logger.config.mjs';

export default function OrderReviewPage() {
  const locale = useLocale();
  const t = useTranslations();
  const { currentUser } = useContext(AppContext);
  
  const HEADER = 'font-bold text-lg md:text-2xl';

  /**
   * Safe integration of usePagination hook.
   * Synchronized with our unified hook logic.
   * Using 'hasNextPage: hasMore' to satisfy existing JSX without breaking logic.
   */
  const {
    data: orderList,
    loading,
    hasNextPage: hasMore,
    lastElementRef
  } = usePagination<any>(
    (page, limit) => fetchBuyerOrders(currentUser?.pi_uid as string, page, limit),
    10
  );

  /**
   * Initial load state.
   * Uses existing Skeleton component to maintain visual consistency.
   */
  if (loading && orderList.length === 0) {
    logger.info('Loading buyer orders list..');
    return (
      <div className="w-full md:w-[500px] md:mx-auto p-4">
        <Skeleton type="seller_review" />
      </div>
    );
  }

  return (
    <>
      <div className="w-full md:w-[500px] md:mx-auto p-4">
        <div className="text-center mb-7">
          <h3 className="text-gray-400 text-sm">{currentUser?.user_name || ""}</h3>
          <h1 className={HEADER}>
            {t('SCREEN.SELLER_ORDER_FULFILLMENT.ORDER_LIST_HEADER')}
          </h1>
        </div>

        {/* Order List Container */}
        <div>
          {orderList.length > 0 ? (
            orderList.map((item, index) => {
              const isLast = index === orderList.length - 1;
              return (
                <Link 
                  href={`/${locale}/user/order-item/${item._id}?user_name=${currentUser?.user_name}`} 
                  key={`${item._id}-${index}`} 
                >
                  <div
                    ref={isLast ? (lastElementRef as any) : null}
                    data-id={item._id}            
                    className={`relative outline outline-50 outline-gray-600 rounded-lg mb-7 
                      ${item.status === OrderStatusType.Completed ? 'bg-yellow-100' : 
                        item.status === OrderStatusType.Cancelled ? 'bg-red-100' : ''}`}
                  >
                    <div className="p-3">
                      <div className="flex gap-x-4">
                        <div className="flex-auto w-64">
                          <Input
                            label={t('SCREEN.SELLER_ORDER_FULFILLMENT.ORDER_HEADER_ITEMS_FEATURE.SELLER_LABEL') + ':'}
                            name="name"
                            type="text"
                            value={item.seller_id?.name || ""}
                            disabled={true}
                          />
                        </div>
                        <div className="flex-auto w-32">
                          <div className="flex items-center gap-2">
                            <Input
                              label={t('SCREEN.SELLER_ORDER_FULFILLMENT.ORDER_HEADER_ITEMS_FEATURE.TOTAL_PRICE_LABEL') + ':'}
                              name="price"
                              type="number"
                              value={item.total_amount?.$numberDecimal || item.total_amount?.toString() || "0"}
                              disabled={true}
                            />
                            <p className="text-gray-500 text-sm">π</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-x-4 w-full mt-1">
                        <div className="flex-auto w-64">
                          <label className="block text-[17px] text-[#333333] mb-1">
                            {t('SCREEN.SELLER_ORDER_FULFILLMENT.ORDER_HEADER_ITEMS_FEATURE.TIME_OF_ORDER_LABEL') + ':'}
                          </label>
                          <div className="p-[10px] block rounded-xl border-[#BDBDBD] bg-transparent outline-0 focus:border-[#1d724b] border-[2px] w-full mb-2">
                            {item?.createdAt && (() => {
                              const { date, time } = resolveDate(item.createdAt, locale);
                              return (
                                <label className="text-[14px] text-[#333333]">
                                  {date}, {time}
                                </label>
                              );
                            })()}
                          </div>
                        </div>
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
              );
            })
          ) : (
            // Displayed only if no orders are found after loading
            !loading && <div className="text-center py-10 text-gray-500">{t('SHARED.NO_DATA')}</div>
          )}

          {/* Pagination Status / Loader */}
          <div className="h-20 w-full flex justify-center items-center">
            {loading && orderList.length > 0 && <div className="animate-spin text-primary text-2xl">🌀</div>}
            {!hasMore && orderList.length > 0 && (
              <p className="text-gray-500 text-sm italic">{t('SHARED.NO_MORE_DATA')}</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

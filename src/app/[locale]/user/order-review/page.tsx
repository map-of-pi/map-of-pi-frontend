'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import React, { useEffect, useState, useContext, useRef } from 'react';
import { Input } from '@/components/shared/Forms/Inputs/Inputs';
import Skeleton from '@/components/skeleton/skeleton';
import { PartialOrderType, OrderStatusType } from '@/constants/types';
import { fetchBuyerOrders } from '@/services/orderApi';
import { useScrollablePagination } from '@/hooks/useScrollablePagination';
import { resolveDate } from '@/utils/date';
import { translateOrderStatusType } from '@/utils/translate';

import { AppContext } from '../../../../../context/AppContextProvider';
import logger from '../../../../../logger.config.mjs';

export default function OrderReviewPage() {
  const locale = useLocale();
  const t = useTranslations();

  const HEADER = 'font-bold text-lg md:text-2xl';

  const { currentUser, setOrdersCount } = useContext(AppContext);
  const [loading, setLoading] = useState<boolean>(false);
  const [orderList, setOrderList] = useState<PartialOrderType[]>([]);
  const [skip, setSkip] = useState(0);
  const [limit] = useState(5);
  const [hasFetched, setHasFetched] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const observer = useRef<IntersectionObserver | null>(null);

  const handleOrderItemRef = (node: HTMLElement | null) => {
    if (node && observer.current) {
      observer.current.observe(node);
    }
  };

  const sortOrders = (
    current: PartialOrderType[],
    incoming: PartialOrderType[]
  ): PartialOrderType[] => {
    const seen = new Set<string>();
    const pending: PartialOrderType[] = [];
    const others: PartialOrderType[] = [];

    for (const order of [...current, ...incoming]) {
      if (seen.has(order._id)) continue;
      seen.add(order._id);

      if (order.status === OrderStatusType.Pending) {
        pending.push(order);
      } else {
        others.push(order);
      }
    }

    return [...pending, ...others];
  };

  const fetchOrders = async () => {
    if (loading || !currentUser?.pi_uid || !hasMore) return;

    setLoading(true);

    try {
      const { items, count } = await fetchBuyerOrders({ skip, limit });

      logger.info('Fetched buyer orders:', { itemsLength: items.length, count });

      if (items.length > 0) {
        // Merge and sort orders; pending first, then others
        setOrderList((prev) => sortOrders(prev, items as PartialOrderType[]));

        // Increment skip by number of new items
        const newSkip = skip + items.length;
        setSkip(newSkip);

        // Determine if there are more orders
        setHasMore(newSkip < count);
      } else {
        // No items returned → no more orders
        setHasMore(false);
      }
    } catch (error) {
      logger.error('Error fetching buyer orders:', error);
    } finally {
      setHasFetched(true);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!currentUser?.pi_uid) return;

    setOrderList([]);
    setSkip(0);
    setHasMore(true);
    fetchOrders();
  }, [currentUser?.pi_uid]);

  useScrollablePagination({
    containerRef: scrollContainerRef,
    loadMoreRef,
    fetchNextPage: async () => {
      setLoading(true);
      await fetchOrders();
    },
    hasMore,
    isLoading: loading,
  });

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

      {/* Review Order | Online Shopping */}
      <div
        ref={scrollContainerRef}
        id="order-scroll-container"
        className="max-h-[600px] overflow-y-auto p-1 mb-7 mt-3"
      >
        {!loading && hasFetched && orderList.length === 0 ? (
          <h2 className="font-bold mb-2 text-center">
            No orders found
          </h2>
        ) : (
          orderList.map((item, index)=>(
          <Link href={`/${locale}/user/order-item/${item._id}?user_name=${currentUser?.user_name}`} key={item._id} > 
            <div
              ref={handleOrderItemRef}
              data-id={item._id}            
              className={`relative outline outline-50 outline-gray-600 rounded-lg mb-7 
                ${item.status === OrderStatusType.Completed ? 'bg-yellow-100' : item.status === OrderStatusType.Cancelled ? 
              'bg-red-100' : ''}`}
            >
              <div className="p-3">
                <div className="flex gap-x-4">
                  <div className="flex-auto w-64">
                    <Input
                      label={t('SCREEN.SELLER_ORDER_FULFILLMENT.ORDER_HEADER_ITEMS_FEATURE.SELLER_LABEL') + ':'}
                      name="name"
                      type="text"
                      value={item.seller_id.name}
                      disabled={true}
                    />
                  </div>
        
                  <div className="flex-auto w-32">
                    <div className="flex items-center gap-2">
                      <Input
                        label={t('SCREEN.SELLER_ORDER_FULFILLMENT.ORDER_HEADER_ITEMS_FEATURE.TOTAL_PRICE_LABEL') + ':'}
                        name="price"
                        type="number"
                        value={item.total_amount.$numberDecimal || item.total_amount.$numberDecimal.toString()}
                        disabled={true}
                      />
                      <p className="text-gray-500 text-sm">π</p>
                    </div>
                  </div>
                </div>
                <div>
                </div>
                
                <div className="flex gap-x-4 w-full mt-1">
                  <div className="flex-auto w-64">
                    <label className="block text-[17px] text-[#333333] mb-1">
                      {t('SCREEN.SELLER_ORDER_FULFILLMENT.ORDER_HEADER_ITEMS_FEATURE.TIME_OF_ORDER_LABEL') + ':'}
                    </label>
                    <div
                      className={`p-[10px] block rounded-xl border-[#BDBDBD] bg-transparent outline-0 focus:border-[#1d724b] border-[2px] w-full mb-2`}
                    >
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
        ))
        )}

        {/* Load more trigger */}
        {loading && <Skeleton type="seller_review" />}
        <div ref={loadMoreRef} className="h-[20px]" />
      </div>
    </div>  
    </>
  );
}

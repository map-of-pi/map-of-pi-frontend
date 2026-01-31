'use client';

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import React, { useRef } from "react";
import { Button } from "../Forms/Buttons/Buttons";
import { Input } from "../Forms/Inputs/Inputs";
// تصحيح المسار لضمان التوافق مع أنظمة Linux في الـ Build (حرف s صغير)
import Skeleton from "../../skeleton/skeleton"; 
import { OrderStatusType } from "@/constants/types";
import { fetchSellerOrders } from "@/services/orderApi";
import { resolveDate } from "@/utils/date";
import { usePagination } from "@/hooks/usePagination"; 

/**
 * ListOrder Component
 * Handles the display of orders for a seller with infinite scroll.
 * Optimized for Map-of-Pi ecosystem scalability.
 */
export const ListOrder: React.FC<{
  user_id: string;
  user_name?: string;
  seller_type?: string;
}> = ({ user_id, user_name="", seller_type="" }) => {
  const locale = useLocale();
  const t = useTranslations();

  /**
   * Unified pagination hook for seller incoming orders.
   * Maps 'hasNextPage' (new hook output) to 'hasMore' (legacy JSX variable) 
   * to ensure zero breaking changes in the UI logic.
   */
  const {
    data: orderList,
    loading,
    hasNextPage: hasMore, // إعادة تسمية المخرج ليناسب الكود القديم
    lastElementRef
  } = usePagination<any>(
    (page, limit) => fetchSellerOrders(user_id, page, limit),
    10
  );

  return (
    <div>
      {orderList.length > 0 ? (
        orderList.map((item, index) => {
          const isLast = index === orderList.length - 1;
          return (
            <div
              key={`${item._id}-${index}`}
              // ربط الـ Ref بالعنصر الأخير لتفعيل الـ Infinite Scroll التلقائي للمستخدم
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
                      label={t('SHARED.PIONEER_LABEL') + ':'}
                      name="name"
                      type="text"
                      value={item.buyer_id?.pi_username || ""}
                      disabled={true}
                    />
                  </div>

                  <div className="flex-auto w-32">
                    <div className="flex items-center gap-2">
                      <Input
                        label={t('SCREEN.SELLER_ORDER_FULFILLMENT.ORDER_HEADER_ITEMS_FEATURE.TOTAL_PRICE_LABEL') + ':'}
                        name="price"
                        type="number"
                        // معالجة آمنة لنوع البيانات القادمة من MongoDB Decimal128
                        value={item.total_amount?.$numberDecimal || item.total_amount?.toString() || "0"}
                        disabled={true}
                      />
                      <p className="text-gray-500 text-sm">π</p>
                    </div>
                  </div>
                </div>
                
                <label className="block text-[17px] text-[#333333] mt-2">
                  {t('SCREEN.SELLER_ORDER_FULFILLMENT.ORDER_HEADER_ITEMS_FEATURE.TIME_OF_ORDER_LABEL') + ':'}
                </label>
                <div className="flex items-center gap-4 w-full mt-1">
                  <div className="p-[10px] block rounded-xl border-[#BDBDBD] bg-transparent outline-0 focus:border-[#1d724b] border-[2px] w-full">
                    {item?.createdAt && (() => {
                      const { date, time } = resolveDate(item.createdAt, locale);
                      return (
                        <label className="text-[14px] text-[#333333]">
                          {date}, {time}
                        </label>
                      );
                    })()}
                  </div>
                  <Link href={seller_type ? 
                    `/${locale}/seller/order-fulfillment/${item._id}?seller_name=${user_name}&seller_type=${seller_type}` 
                    :
                    `/${locale}/user/order-item/${item._id}?seller_name=${user_name}`}
                  >       
                    <Button
                      label={t('SHARED.FULFILL')}
                      disabled={false} 
                      styles={{
                        color: '#ffc153',
                        height: '40px',
                        padding: '10px 15px'
                      }}
                    />
                  </Link>
                </div>
              </div>
            </div>
          );
        })
      ) : (
        !loading && <p className="text-center text-gray-500 py-4">{t('SHARED.NO_DATA')}</p>
      )}

      {/* Pagination Status / Loader */}
      <div className="h-14 w-full flex justify-center items-center mt-2">
        {loading && <div className="animate-pulse text-[#ffc153] font-bold">{t('SHARED.LOADING')}...</div>}
        {!hasMore && orderList.length > 0 && (
          <p className="text-xs text-gray-400 italic">{t('SHARED.NO_MORE_DATA')}</p>
        )}
      </div>
    </div>
  );
};

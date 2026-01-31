'use client';

import React, { useRef } from "react";
/**
 * FIX: Corrected import from 'Skeleton' to 'skeleton' (lowercase)
 * to match the actual file name on disk and fix Linux build failure.
 */
import Skeleton from "../../skeleton/skeleton"; 
import { usePagination } from "@/hooks/usePagination";
import { fetchSellerOrders } from "@/services/orderApi";
import { useTranslations } from "next-intl";

interface OrderListSkeletonProps {
  user_id: string;
}

/**
 * OrderListSkeleton Component
 * This serves as a layout wrapper that shows a loading state
 * while perfectly aligning with the MERN pagination logic.
 */
export const OrderListSkeleton: React.FC<OrderListSkeletonProps> = ({ user_id }) => {
  const t = useTranslations();

  /**
   * Safe integration of our unified hook.
   * Maps 'hasNextPage' to 'hasMore' to ensure the JSX below remains stable.
   */
  const {
    data: orderList,
    loading,
    hasNextPage: hasMore,
    lastElementRef
  } = usePagination<any>(
    (page, limit) => fetchSellerOrders(user_id, page, limit),
    10
  );

  return (
    <div className="order-list-skeleton-container w-full">
      {/* Initial Loading State:
          Displayed only when the first page is being fetched.
      */}
      {loading && orderList.length === 0 && (
        <div className="flex flex-col gap-6">
          {[...Array(4)].map((_, index) => (
            <div key={`skeleton-${index}`} className="w-full p-4 border border-gray-100 rounded-xl">
              <Skeleton type="seller_review" />
            </div>
          ))}
        </div>
      )}

      {/* Data Render Area (Optional): 
          If this component is used as a standalone list with built-in skeleton.
      */}
      <div className="flex flex-col gap-4 mt-2">
        {orderList.length > 0 && orderList.map((item: any, index: number) => {
          const isLast = index === orderList.length - 1;
          return (
            <div 
              key={item._id || index}
              ref={isLast ? (lastElementRef as any) : null}
              className="p-4 bg-white shadow-sm rounded-lg border border-gray-100 opacity-50"
            >
               {/* Minimal item info to maintain layout during scroll-loading */}
               <div className="h-4 w-3/4 bg-gray-200 animate-pulse rounded mb-2"></div>
               <div className="h-3 w-1/2 bg-gray-100 animate-pulse rounded"></div>
            </div>
          );
        })}
      </div>

      {/* Infinite Scroll & Loading More Indicator:
          Ensures a smooth visual transition when fetching subsequent pages.
      */}
      <div className="py-6 flex justify-center items-center">
        {loading && orderList.length > 0 && (
          <div className="w-full max-w-md">
             <Skeleton type="seller_review" />
          </div>
        )}
        
        {!hasMore && orderList.length > 0 && (
          <p className="text-gray-400 text-xs italic">
            {t('SHARED.NO_MORE_DATA')}
          </p>
        )}
      </div>
    </div>
  );
};

export default OrderListSkeleton;

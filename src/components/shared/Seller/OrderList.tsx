'use client';

import React from "react";
/**
 * FIX: Unified import for skeleton
 */
import Skeleton from "../../skeleton/skeleton"; 
import { usePagination } from "@/hooks/usePagination";
import { fetchSellerOrders } from "@/services/orderApi";
import { useTranslations } from "next-intl";

// --- Interfaces ---
interface OrderListProps {
  user_id: string;
  user_name?: string;
  seller_type?: string;
}

/**
 * OrderList Component (The Core Logic)
 * Compatible with MERN Backend & Infinite Scroll Pagination
 */
export const ListOrder: React.FC<OrderListProps> = ({ user_id, user_name, seller_type }) => {
  const t = useTranslations();

  /**
   * Safe integration of our unified hook.
   * Standardizes the data flow for Web3 scalable solutions.
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
    <div className="order-list-main-container w-full">
      {/* Loading Skeleton during initial fetch */}
      {loading && orderList.length === 0 && (
        <div className="flex flex-col gap-6">
          {[...Array(3)].map((_, index) => (
            <div key={`order-skeleton-${index}`} className="p-4 border border-gray-100 rounded-xl">
              <Skeleton type="seller_review" />
            </div>
          ))}
        </div>
      )}

      {/* Actual Data Rendering */}
      <div className="flex flex-col gap-4">
        {orderList.length > 0 ? (
          orderList.map((order: any, index: number) => {
            const isLast = index === orderList.length - 1;
            return (
              <div 
                key={order._id || index}
                ref={isLast ? (lastElementRef as any) : null}
                className="p-4 bg-white shadow-sm rounded-lg border border-gray-200"
              >
                <div className="flex justify-between items-center">
                   <h4 className="font-bold text-sm">Order ID: #{order._id?.slice(-6)}</h4>
                   <span className="text-xs px-2 py-1 bg-gray-100 rounded capitalize">{order.status}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{order.fulfillment_method}</p>
              </div>
            );
          })
        ) : (
          !loading && <p className="text-center text-gray-400 py-10">{t('SHARED.NO_DATA_FOUND')}</p>
        )}
      </div>

      {/* Infinite Scroll Indicator */}
      {loading && orderList.length > 0 && (
        <div className="py-4">
          <Skeleton type="seller_review" />
        </div>
      )}

      {!hasMore && orderList.length > 0 && (
        <p className="text-center text-gray-400 text-xs italic py-4">
          {t('SHARED.NO_MORE_DATA')}
        </p>
      )}
    </div>
  );
};

/**
 * OrderListSkeleton Component
 * Exported separately if needed elsewhere, but kept here for stability.
 */
export const OrderListSkeleton: React.FC<{ user_id: string }> = ({ user_id }) => {
  return (
    <div className="opacity-70 grayscale pointer-events-none">
      <ListOrder user_id={user_id} />
    </div>
  );
};

// Default export is the main component (Essential for the Registration Page build)
export default ListOrder;

'use client';

import React from "react";
/**
 * FIX: Updated import path to use 'MainSkeleton' to avoid directory/file name conflict.
 * Removed .tsx extension to comply with TypeScript import standards.
 */
import Skeleton from "../../skeleton/MainSkeleton"; 
import { usePagination } from "@/hooks/usePagination";
import { fetchSellerOrders } from "@/services/orderApi";
import { useTranslations } from "next-intl";

// --- Interfaces (Maintained for Backend compatibility) ---
interface OrderListProps {
  user_id: string;
  user_name?: string;
  seller_type?: string;
}

/**
 * ListOrder Component
 * Handles the main order listing logic within the Pi Network ecosystem.
 * Integrated with MERN stack pagination and infinite scroll.
 */
export const ListOrder: React.FC<OrderListProps> = ({ user_id, user_name, seller_type }) => {
  const t = useTranslations();

  /**
   * Unified pagination hook integration.
   * Ensures scalable Web3 data fetching for Map-of-Pi.
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
      {/* Initial Loading Phase: Shows skeleton while fetching the first page */}
      {loading && orderList.length === 0 && (
        <div className="flex flex-col gap-6">
          {[...Array(3)].map((_, index) => (
            <div key={`order-skeleton-${index}`} className="p-4 border border-gray-100 rounded-xl">
              <Skeleton type="seller_review" />
            </div>
          ))}
        </div>
      )}

      {/* Main Content Area: Renders the actual order data */}
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

      {/* Footer State: Shows additional loading or end-of-list message */}
      <div className="py-6 flex justify-center items-center">
        {loading && orderList.length > 0 && (
          <div className="w-full">
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

/**
 * OrderListSkeleton Component
 * Exported for standalone usage where a loading placeholder is required.
 */
export const OrderListSkeleton: React.FC<{ user_id: string }> = ({ user_id }) => {
  return (
    <div className="opacity-70 grayscale pointer-events-none">
      <ListOrder user_id={user_id} />
    </div>
  );
};

// Default export is essential for the registration flow build stability
export default ListOrder;

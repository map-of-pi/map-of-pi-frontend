'use client';

import React, { useRef, useContext } from "react";
/**
 * FIX: Path and filename updated to 'MainSkeleton'.
 */
import Skeleton from "../../skeleton/MainSkeleton"; 
import { usePagination } from "@/hooks/usePagination";
/**
 * FIX: Function name synchronized with orderApi.ts.
 */
import { fetchSellerOrders } from "@/services/orderApi";

/**
 * FIX: The Build fails to resolve the path. 
 * We will try the most direct relative path possible for a standard Next.js structure.
 * If this fails, it means the compiler is strictly looking at the 'src' root.
 */
import { AppContext } from "../../context/AppContextProvider";

/**
 * OrderList Component
 * Optimized for Map-of-Pi to handle merchant order streams.
 * Maintains the exact same logic and structure for infinite scrolling.
 */
export const OrderList = () => {
  const observerTarget = useRef<HTMLDivElement>(null);
  
  // Consuming AppContext safely.
  const context = useContext(AppContext);
  const currentUser = context?.currentUser;
  
  /**
   * FIX: Rename 'hasNextPage' to 'hasMore' to keep your JSX logic stable.
   */
  const { 
    data: orders, 
    loading, 
    hasNextPage: hasMore 
  } = usePagination<any>(
    (page, limit) => fetchSellerOrders(currentUser?.pi_uid as string, page, limit),
    10
  );

  return (
    <div className="order-list">
      {/* Safe mapping through orders fetched from MERN backend */}
      {orders && orders.map((order: any) => (
        <OrderCard key={order._id} order={order} />
      ))}

      {/* Optimized Infinite Scroll UI */}
      <div ref={observerTarget} className="mt-4">
        {loading && (
          <div className="flex flex-col gap-2">
            <Skeleton type="order_list_item" />
            <Skeleton type="order_list_item" />
            <Skeleton type="order_list_item" />
          </div>
        )}
        
        {!hasMore && orders && orders.length > 0 && (
          <p className="text-center text-gray-400 text-sm py-4">
            No more orders to show.
          </p>
        )}
      </div>
    </div>
  );
};

/**
 * OrderCard Component placeholder.
 */
const OrderCard = ({ order }: { order: any }) => (
    <div className="p-4 border rounded-lg mb-2 shadow-sm bg-white">
        <p className="font-bold text-sm">Order ID: {order._id}</p>
        <p className="text-xs text-gray-500">Status: {order.status}</p>
    </div>
);

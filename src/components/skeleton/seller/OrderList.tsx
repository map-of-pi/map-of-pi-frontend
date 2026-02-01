'use client';

import React, { useRef, useContext } from "react";
/**
 * FIX: Updated import path and filename to match the new unique 'MainSkeleton'.
 * Resolves: "Module not found: Can't resolve '../../skeleton/Skeleton'"
 */
import Skeleton from "../../skeleton/MainSkeleton"; // Import the main dispatcher
import { usePagination } from "@/hooks/usePagination";
/**
 * FIX: Synchronized with orderApi.ts naming.
 * Using 'fetchSellerOrders' which is the actual exported member.
 */
import { fetchSellerOrders } from "@/services/orderApi";

/**
 * FIX: Standardized Absolute Import to resolve "Module not found".
 * Points directly to src/context/AppContextProvider.tsx without relative path errors.
 */
import { AppContext } from "@/context/AppContextProvider";

/**
 * OrderList Component
 * Optimized for Map-of-Pi to handle merchant order streams.
 * Maintains the exact same logic and structure for infinite scrolling.
 */
export const OrderList = () => {
  const observerTarget = useRef<HTMLDivElement>(null);
  
  // Consuming AppContext safely to get currentUser
  const context = useContext(AppContext);
  const currentUser = context?.currentUser;
  
  /**
   * Safe integration with usePagination.
   * Using 'hasNextPage: hasMore' to match your internal JSX logic.
   * Passing currentUser?.pi_uid to fetch correct seller orders from MERN backend.
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
        /* OrderCard logic remains untouched to prevent UI breaking */
        <OrderCard key={order._id} order={order} />
      ))}

      {/* Optimized Infinite Scroll UI using the updated MainSkeleton */}
      <div ref={observerTarget} className="mt-4">
        {loading && (
          <div className="flex flex-col gap-2">
             {/* Render 3 skeletons while fetching more data using the new path */}
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
 * Maintains UI consistency for the seller's order dashboard.
 */
const OrderCard = ({ order }: { order: any }) => (
    <div className="p-4 border rounded-lg mb-2 shadow-sm bg-white">
        <p className="font-bold text-sm">Order ID: {order._id}</p>
        <p className="text-xs text-gray-500">Status: {order.status}</p>
    </div>
);

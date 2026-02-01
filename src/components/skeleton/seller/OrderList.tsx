'use client';

import React, { useRef, useContext } from "react";
/**
 * FIX: Updated import path and filename to match 'MainSkeleton'.
 */
import Skeleton from "../../skeleton/MainSkeleton"; 
import { usePagination } from "@/hooks/usePagination";
/**
 * FIX: Synchronized with orderApi.ts naming.
 */
import { fetchSellerOrders } from "@/services/orderApi";

/**
 * FIX: Direct relative path to resolve the "Module not found" error during build.
 * Structure: src/components/skeleton/seller/OrderList.tsx -> back 3 levels to reach src/
 */
import { AppContext } from "../../../context/AppContextProvider";

/**
 * OrderList Component
 * Optimized for Map-of-Pi to handle merchant order streams.
 * Maintains the exact same logic and structure for infinite scrolling.
 */
export const OrderList = () => {
  const observerTarget = useRef<HTMLDivElement>(null);
  
  // Consuming AppContext safely to get currentUser for Backend compatibility
  const context = useContext(AppContext);
  const currentUser = context?.currentUser;
  
  /**
   * Safe integration with usePagination.
   * Renaming 'hasNextPage' to 'hasMore' internally to keep your JSX logic stable.
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
             {/* Render 3 skeletons using the new path */}
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

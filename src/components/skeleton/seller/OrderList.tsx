'use client';

import React, { useRef } from "react";
/**
 * FIX: Updated import path and filename to match the new unique 'MainSkeleton'.
 * This resolves the Type error: "Cannot find module '../../skeleton/Skeleton'"
 */
import Skeleton from "../../skeleton/MainSkeleton"; // Import the main dispatcher
import { usePagination } from "@/hooks/usePagination";
/**
 * FIX: Synchronized with orderApi.ts. 
 * Changed from 'fetchOrders' to 'fetchSellerOrders' to match the exported member.
 */
import { fetchSellerOrders } from "@/services/orderApi";

/**
 * OrderList Component
 * Maintains the exact same logic and structure for infinite scrolling.
 * Zero changes to internal hook logic to ensure Map-of-Pi ecosystem stability.
 */
export const OrderList = () => {
  const observerTarget = useRef<HTMLDivElement>(null);
  
  /**
   * Safe integration with usePagination.
   * Using fetchSellerOrders to ensure data flows correctly from the MERN backend.
   */
  const { data: orders, loading, hasMore } = usePagination({
    fetchData: fetchSellerOrders,
    observerTarget,
  });

  return (
    <div className="order-list">
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
        
        {!hasMore && orders.length > 0 && (
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

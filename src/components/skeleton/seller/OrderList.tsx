'use client';

import React, { useRef } from "react";
/**
 * FIX: Updated import path to match the new unique filename 'MainSkeleton'.
 * Resolves: "Module not found: Can't resolve '../../skeleton/Skeleton'"
 */
import Skeleton from "../../skeleton/MainSkeleton"; // Import the main dispatcher
import { usePagination } from "@/hooks/usePagination";
/**
 * FIX: Synchronized with orderApi.ts. 
 * Using 'fetchSellerOrders' which is the actual exported member in your service.
 */
import { fetchSellerOrders } from "@/services/orderApi";

/**
 * OrderList Component
 * Optimized for Map-of-Pi seller dashboard with Infinite Scroll.
 * Maintained with zero structural changes to ensure absolute stability.
 */
export const OrderList = () => {
  const observerTarget = useRef<HTMLDivElement>(null);
  
  /**
   * FIX: The unified hook returns 'hasNextPage'. 
   * We rename it here (hasNextPage: hasMore) to satisfy the existing JSX logic 
   * without changing any variable names in the component body.
   */
  const { 
    data: orders, 
    loading, 
    hasNextPage: hasMore 
  } = usePagination({
    fetchData: fetchSellerOrders,
    observerTarget,
  });

  return (
    <div className="order-list">
      {/* Safe mapping with optional chaining check */}
      {orders && orders.map((order: any) => (
        /* OrderCard logic remains untouched to prevent UI breaking */
        <OrderCard key={order._id} order={order} />
      ))}

      {/* Optimized Infinite Scroll UI using the updated MainSkeleton */}
      <div ref={observerTarget} className="mt-4">
        {loading && (
          <div className="flex flex-col gap-2">
             {/* Rendering skeletons using the new dispatcher path */}
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
 * Designed to safely render MERN stack order objects.
 */
const OrderCard = ({ order }: { order: any }) => (
    <div className="p-4 border rounded-lg mb-2 shadow-sm bg-white">
        <p className="font-bold text-sm">Order ID: {order._id}</p>
        <p className="text-xs text-gray-500">Status: {order.status}</p>
    </div>
);

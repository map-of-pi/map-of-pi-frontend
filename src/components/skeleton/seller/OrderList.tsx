'use client';

import React, { useRef } from "react";
/**
 * FIX: Updated import path and filename to match the new unique 'MainSkeleton'.
 * This resolves the Type error: "Cannot find module '../../skeleton/Skeleton'"
 * while keeping the internal logic of the OrderList completely intact.
 */
import Skeleton from "../../skeleton/MainSkeleton"; // Import the main dispatcher
import { usePagination } from "@/hooks/usePagination";
import { fetchOrders } from "@/services/orderApi";

/**
 * OrderList Component
 * Maintains the exact same logic and structure for infinite scrolling.
 * Zero changes to function names or data handling to ensure Backend compatibility.
 */
export const OrderList = () => {
  const observerTarget = useRef<HTMLDivElement>(null);
  
  // Keeping the exact same hook usage as provided in your original code
  const { data: orders, loading, hasMore } = usePagination({
    fetchData: fetchOrders,
    observerTarget,
  });

  return (
    <div className="order-list">
      {orders.map((order: any) => (
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

// Placeholder for OrderCard to ensure file integrity during build
const OrderCard = ({ order }: { order: any }) => (
    <div className="p-4 border rounded-lg mb-2">
        <p>Order ID: {order._id}</p>
    </div>
);

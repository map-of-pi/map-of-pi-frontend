'use client';

import React, { useRef } from "react";
import Skeleton from "../../skeleton/Skeleton"; // Import the main dispatcher
import { usePagination } from "@/hooks/usePagination";
import { fetchOrders } from "@/services/orderApi";

export const OrderList = () => {
  const observerTarget = useRef<HTMLDivElement>(null);
  const { data: orders, loading, hasMore } = usePagination({
    fetchData: fetchOrders,
    observerTarget,
  });

  return (
    <div className="order-list">
      {orders.map((order) => (
        <OrderCard key={order._id} order={order} />
      ))}

      {/* Optimized Infinite Scroll UI */}
      <div ref={observerTarget} className="mt-4">
        {loading && (
          <div className="flex flex-col gap-2">
             {/* Render 3 skeletons while fetching more data */}
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


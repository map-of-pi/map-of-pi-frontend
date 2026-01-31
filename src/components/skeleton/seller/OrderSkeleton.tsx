import React from 'react';
import '../skeleton.css';

/**
 * OrderSkeleton Component
 * Designed specifically for the Order Management dashboard.
 * Matches the layout of individual order cards to provide a seamless infinite scroll experience.
 */
export const OrderSkeleton = () => {
  return (
    <div className="relative border border-gray-100 rounded-lg mb-6 p-4 skeleton bg-white shadow-sm">
      {/* Header Section: Order ID and Status Badge */}
      <div className="flex justify-between items-center border-b pb-3 mb-3 my-bg-trans">
        <div className="h-5 w-40 bg-gray-200 rounded"></div>
        <div className="h-6 w-20 bg-gray-300 rounded-full"></div>
      </div>

      {/* Body Section: Customer Info and Order Date */}
      <div className="space-y-3 my-bg-trans">
        <div className="h-4 w-1/2 bg-gray-100 rounded"></div>
        <div className="h-4 w-1/4 bg-gray-100 rounded"></div>
      </div>

      {/* Footer Section: Action Buttons (Confirm/Cancel) */}
      <div className="mt-4 flex gap-3 my-bg-trans">
        <div className="h-10 flex-1 bg-gray-200 rounded-lg"></div>
        <div className="h-10 w-24 bg-gray-100 rounded-lg"></div>
      </div>
    </div>
  );
};


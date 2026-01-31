import React from 'react';
import '../skeleton.css';

/**
 * SkeletonSellerReview Component
 * Provides a loading placeholder for individual merchant reviews.
 * Specifically designed for the seller's feedback management dashboard.
 */
export const SkeletonSellerReview = () => {
  return (
    <>
      {/* Main container with max-width for responsive tablet/desktop view */}
      <div className="px-4 py-[20px] skeleton sm:max-w-[520px] w-full m-auto">
        
        {/* Review title or Giver name placeholder */}
        <div className="w-[70%] h-7 mb-5"></div>
        
        {/* Review body and metadata container */}
        <div className="border-b border-[#D9D9D9] py-4 my-bg-trans">
          
          {/* Main comment/feedback placeholder */}
          <div className="w-[90%] h-7 mb-3"></div>

          {/* Review attributes or tags placeholder */}
          <div className="flex w-full my-bg-trans gap-3 mb-4">
            <div className="w-[20%] h-5"></div>
            <div className="w-[20%] h-5"></div>
          </div>
          
          {/* Timestamp/Date placeholder */}
          <div className="w-[20%] h-5 mb-3"></div>

          {/* TrustMeter and user avatar placeholder footer */}
          <div className="flex w-full items-center my-bg-trans gap-3 mb-4">
            <div className="w-5 h-5 rounded-[50%]"></div>
            <div className="w-[12%] h-3"></div>
            <div className="w-[60px] h-[33px] rounded-sm"></div>
          </div>
        </div>
      </div>
    </>
  );
};

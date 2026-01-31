import React from 'react';
import '../skeleton.css';

/**
 * SkeletonSellerRegistration Component
 * Provides a comprehensive loading placeholder for the merchant onboarding form.
 * Matches the multi-step input structure of the Seller Registration flow.
 */
export const SkeletonSellerRegistration = () => {
  return (
    <>
      <div className="w-full md:w-[500px] md:mx-auto p-4 skeleton">
        {/* Form Title and Description placeholders */}
        <div className="w-[60%] h-7 mb-5"></div>
        <div className="w-[38%] h-6 mb-8"></div>
        
        {/* Top Action/Banner placeholder */}
        <div className="w-full h-17 mb-2 rounded-md"></div>
        <div className="w-[145px] h-10 ml-auto rounded-md mb-2"></div>
        
        {/* Profile Image/Logo Section placeholder */}
        <div className="w-[35%] mb-2 mt-1 h-6 "></div>
        <div className="flex w-full my-bg-trans gap-2 mb-3">
          <div className="w-[28%] h-4"></div>
          <div className="flex-grow h-[75px]"></div>
        </div>
        
        {/* Location/Coordinates Section placeholder */}
        <div className="flex w-full my-bg-trans justify-between mb-4">
          <div className="w-[38%] h-4 mb-8"></div>
          <div className="w-[140px] rounded-md h-10"></div>
        </div>
        
        {/* Informational Text blocks placeholders */}
        <div className="w-[48%] mb-2 mt-1 h-4 "></div>
        <div className="w-[35%] mb-2 mt-1 h-4 "></div>
        <div className="w-[40%] mb-4 mt-1 h-4 "></div>
        <div className="w-[45%] mb-4 mt-1 h-4 "></div>

        {/* Section Divider/Subtitle placeholder */}
        <div className="w-[30%] mb-2 mt-1 h-5 "></div>

        {/* Dynamic Form Fields (Repeated Input patterns) */}
        {/* Business Name Field */}
        <div className="w-[28%] mb-3 mt-1 h-4 "></div>
        <div className="w-full h-12 mb-3 rounded-md"></div>

        {/* Business Type Field */}
        <div className="w-[28%] mb-3 mt-1 h-4 "></div>
        <div className="w-full h-12 mb-3 rounded-md"></div>

        {/* Phone/Contact Field */}
        <div className="w-[28%] mb-3 mt-1 h-4 "></div>
        <div className="w-full h-12 mb-3 rounded-md"></div>

        {/* Short Description Field */}
        <div className="w-[28%] mb-3 mt-1 h-4 "></div>
        <div className="w-full h-17 mb-3 rounded-md"></div>

        {/* Address Details Field */}
        <div className="w-[30%] mb-3 mt-1 h-4 "></div>
        <div className="w-full h-17 mb-3 rounded-md"></div>

        {/* Long Description/Items List Field */}
        <div className="w-[30%] mb-2 mt-1 h-4 "></div>
        <div className="w-full h-44 mb-3 rounded-md"></div>

        {/* Final Submission Button placeholder */}
        <div className="w-full h-10 mb-3 rounded-md"></div>
      </div>
    </>
  );
};

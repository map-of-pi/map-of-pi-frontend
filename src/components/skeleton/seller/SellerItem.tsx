import React from 'react';

/**
 * SkeletonSellerItem Component
 * Provides a structural placeholder for merchant items and shop detail views.
 * Designed to prevent layout shifts on the item management and public shop pages.
 */
export const SkeletonSellerItem = () => {
  return (
    <>
      <div className="w-full md:w-[500px] md:mx-auto p-4 skeleton">
        {/* Category/Title placeholder */}
        <div className="w-[40%] h-7 mb-4"></div>
        
        {/* Seller Profile/Avatar Section */}
        <div className="flex w-full my-bg-trans gap-4 mb-3">
          <div className="w-[65px] h-[65px] rounded-[50px]"></div>
          <div className="flex flex-grow flex-col justify-between my-2 gap-2 my-bg-trans">
            <div className="w-[20%] h-3"></div>
            <div className="w-[18%] h-3"></div>
          </div>
        </div>
        
        {/* Item Name and Description placeholders */}
        <div className="w-[35%] h-4 mb-3"></div>
        <div className="w-[60%] h-3 mb-3"></div>

        {/* Input/Action Field 1 placeholder */}
        <div className="w-[38%] h-4 mb-3"></div>
        <div className="w-full h-10 mb-5 rounded-md"></div>

        {/* Pricing/Pi Network Value section placeholder */}
        <div className="w-[38%] h-4 mb-3"></div>
        <div className="w-[80%] h-3 mb-3"></div>
        <div className="w-[135px] h-10 rounded-md mb-2"></div>

        {/* Image Gallery/Media placeholders */}
        <div className="w-[30%] h-4 mb-3"></div>
        <div className="w-[80%] h-3 mb-3"></div>
        <div className="my-bg-trans flex gap-4 mb-3">
            <div className="h-[130px] flex-grow-[1] flex items-end rounded-md p-3">
              <div className="h-[88px] flex-1 rounded-md" style={{backgroundColor: 'var(--default-bg-color)'}}></div>
            </div>
            <div className="h-[130px] flex-grow-[4.1] rounded-md p-3 flex gap-2 items-end">
                <div className="h-[88px] flex-1 rounded-md" style={{backgroundColor: 'var(--default-bg-color)'}}></div>
                <div className="h-[88px] flex-1 rounded-md" style={{backgroundColor: 'var(--default-bg-color)'}}></div>
                <div className="h-[88px] flex-1 rounded-md" style={{backgroundColor: 'var(--default-bg-color)'}}></div>
                <div className="h-[88px] flex-1 rounded-md" style={{backgroundColor: 'var(--default-bg-color)'}}></div>
            </div>
        </div>

        {/* Large Description block placeholder */}
        <div className="w-full h-14 mb-5 rounded-md"></div>

        {/* Bottom Promotional/Social Info area */}
        <div className="w-[45%] h-4 mb-3"></div>
        <div className="w-full h-[180px] flex flex-col justify-end py-3 items-center mb-2 rounded-md">
            <div className="w-[60%] h-3 mb-3" style={{backgroundColor: 'var(--default-bg-color)'}}></div>
            <div className="w-[50%] h-3 mb-3" style={{backgroundColor: 'var(--default-bg-color)'}}></div>
        </div>
        
        {/* Final CTA/Submit Action placeholder */}
        <div className="w-[145px] h-10 ml-auto rounded-md mb-2"></div>
      </div>
    </>
  );
};

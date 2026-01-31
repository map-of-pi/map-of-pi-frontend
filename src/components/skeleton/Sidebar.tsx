import React from 'react';

/**
 * SkeletonSidebar Component
 * Provides a structural loading placeholder for the application's navigation sidebar.
 * Designed to prevent layout shifts in the main navigation area.
 */
export const SkeletonSidebar = () => {
  return (
    <>
      <div className="skeleton">
        {/* Sidebar Header/Title placeholder */}
        <div className="w-[70%] h-7 mb-5"></div>

        {/* Navigation Category 1 */}
        <div className="w-[52%] h-5 mb-2"></div>
        <div className="w-full h-10 mb-3 rounded-md"></div>

        {/* Navigation Category 2 */}
        <div className="w-[52%] h-5 mb-2"></div>
        <div className="w-full h-10 mb-4 rounded-md"></div>

        {/* General Menu Items */}
        <div className="w-full h-10 mb-2 rounded-md"></div>
        <div className="w-full h-10 mb-2 rounded-md"></div>

        {/* Footer/Settings Category */}
        <div className="w-[40%] h-5 mb-2"></div>
        
        {/* Specialized placeholder for Sidebar profile or promotion box */}
        <div className="w-full h-[180px] flex flex-col justify-end py-3 items-center mb-2 rounded-md">
          <div
            className="w-[60%] h-3 mb-3"
            style={{ backgroundColor: 'var(--default-bg-color)' }}></div>
          <div
            className="w-[50%] h-3 mb-3"
            style={{ backgroundColor: 'var(--default-bg-color)' }}></div>
        </div>
      </div>
    </>
  );
};

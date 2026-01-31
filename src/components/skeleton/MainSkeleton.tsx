import React from 'react';
import './skeleton.css';
import { SkeletonSellerRegistration } from './seller/Registration';
import { SkeletonSellerReview } from './seller/Review';
import { SkeletonSellerItem } from './seller/SellerItem';
import { SkeletonSidebar } from './Sidebar';
import { SkeletonNotification } from './Notification';
// New imports for Pagination support without breaking legacy code
import { OrderSkeleton } from './seller/OrderSkeleton'; 

/**
 * Skeleton Dispatcher Component
 * Returns the appropriate skeleton UI based on the 'type' prop.
 * Ensures visual stability during data fetching across the MERN stack.
 */
function Skeleton(props : any) {
  // Legacy cases preserved to ensure application stability
  if (props.type === "seller_registration") return <SkeletonSellerRegistration />;
  
  if (props.type === "seller_review") {
    return Array(8).fill(null).map((_, index) => (
        <SkeletonSellerReview key={index} />
    ));
  }
  
  if (props.type === "seller_item") return <SkeletonSellerItem />;
  
  if (props.type === "sidebar") return <SkeletonSidebar />;
  
  if (props.type === "notification") {
    return Array(10).fill(null).map((_, index) => ( 
      <SkeletonNotification key={index} />
    ));
  }

  // New case to support Infinite Scroll in Order List (Backend Integration)
  if (props.type === "order_list_item") {
    return <OrderSkeleton />;
  }
  
  // Return null as a fallback to prevent runtime crashes on unknown types
  return null; 
}

export default Skeleton;

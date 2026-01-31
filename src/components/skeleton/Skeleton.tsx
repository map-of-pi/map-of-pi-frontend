/**
 * Base Skeleton component.
 * Provides the core 'shimmer' animation and styling.
 */
const Skeleton = ({ className }: { className?: string }) => {
  return (
    <div className={`animate-pulse bg-gray-200 rounded-md ${className}`}></div>
  );
};

export default Skeleton;

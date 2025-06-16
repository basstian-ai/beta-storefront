// src/components/ProductCardSkeleton.tsx
export const ProductCardSkeleton = () => (
  <div className="border p-4 rounded-lg shadow animate-pulse">
    <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-300 xl:aspect-w-7 xl:aspect-h-8 h-48"></div> {/* Added fixed height for consistency */}
    <div className="mt-4 h-6 bg-gray-300 rounded w-3/4"></div>
    <div className="mt-1 h-10 bg-gray-300 rounded"></div> {/* For description */}
    <div className="mt-2 h-8 bg-gray-300 rounded w-1/2"></div> {/* For price */}
    <div className="mt-3 h-10 bg-gray-300 rounded"></div> {/* For button */}
  </div>
);

export default ProductCardSkeleton;

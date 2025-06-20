import ProductCardSkeleton from './ProductCardSkeleton';

export default function SearchResultsSkeleton({ rows = 12 }: { rows?: number }) {
  return (
    <ul role="list" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: rows }).map((_, i) => (
        <li key={i} className="animate-pulse" aria-hidden="true">
          <ProductCardSkeleton />
        </li>
      ))}
    </ul>
  );
}

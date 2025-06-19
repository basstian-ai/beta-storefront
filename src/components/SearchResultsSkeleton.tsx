import ProductCardSkeleton from './ProductCardSkeleton';

export default function SearchResultsSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <ul role="list" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <li key={i}>
          <ProductCardSkeleton />
        </li>
      ))}
    </ul>
  );
}

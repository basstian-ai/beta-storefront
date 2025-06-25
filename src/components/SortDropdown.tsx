'use client';
import { useProductFilters } from '@/store/productFilters';
import { SortOption } from '@/bff/types';

const options: { value: SortOption; label: string }[] = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest' },
];

export default function SortDropdown() {
  const sort = useProductFilters((s) => s.sort);
  const setSort = useProductFilters((s) => s.setSort);

  return (
    <select
      aria-label="Sort products"
      value={sort}
      onChange={(e) => setSort(e.target.value as SortOption)}
      className="border p-2 rounded"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

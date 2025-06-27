'use client';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useProductSearch } from '@/hooks/useProductSearch';
import ProductCard from './ProductCard';
import SearchResultsSkeleton from './SearchResultsSkeleton';
import SearchPager from './SearchPager';

export default function TypesenseSearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const q = searchParams.get('q') ?? '';
  const category = searchParams.get('category') ?? undefined;
  const brand = searchParams.get('brand') ?? undefined;
  const page = Number(searchParams.get('page') ?? '1');
  const perPage = 12;
  const { hits, found, facetCounts, isLoading } = useProductSearch({ q, category, brand, page, perPage });

  const toggle = (field: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (params.get(field) === value) {
      params.delete(field);
    } else {
      params.set(field, value);
    }
    params.delete('page');
    router.replace(`${pathname}?${params.toString()}`);
  };


  if (!q) {
    return <p className="mt-6 text-center text-gray-500">Enter a search term</p>;
  }

  if (isLoading) {
    return <SearchResultsSkeleton />;
  }

  if (found === 0) {
    return <p className="mt-6 text-center">No results</p>;
  }

  return (
    <div className="flex gap-6">
      <aside className="w-56 space-y-4" aria-label="Facets">
        {Object.entries(facetCounts).map(([field, counts]) => (
          <div key={field}>
            <h3 className="font-semibold capitalize mb-2">{field}</h3>
            <ul className="space-y-1">
              {Object.entries(counts).map(([val, count]) => {
                const checked = searchParams.get(field) === val;
                return (
                  <li key={val}>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggle(field, val)}
                      />
                      <span>{val} ({count})</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </aside>
      <div className="flex-1">
        <ul role="list" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {hits.map(h => (
            <li key={h.document.id} className="list-none">
              <ProductCard
                product={{
                  id: h.document.id,
                  title: h.document.name,
                  thumbnail: '',
                  price: h.document.price,
                  slug: h.document.slug,
                  description: h.document.description,
                }}
              />
            </li>
          ))}
        </ul>
        <SearchPager total={found} page={page} perPage={perPage} />
      </div>
    </div>
  );
}

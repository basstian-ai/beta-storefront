'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ProductCard from './ProductCard';
import { fetchJSON } from '@/utils/fetchJSON';

export type SortKey = 'relevance' | 'price-asc' | 'price-desc';

interface SearchResult {
  id: number;
  title: string;
  thumbnail: string | null;
  price: number;
  slug: string;
  description: string;
  effectivePrice?: { amount: number };
}

interface Props {
  initial: SearchResult[];
  q: string;
  sort: SortKey;
  total: number;
  skip: number;
}

export default function SearchClient({ initial, q, sort, total, skip }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [items, setItems] = useState(() => initial);
  const [count, setCount] = useState(total);
  const [pageSkip, setPageSkip] = useState(skip);

  // refetch when query or sort changes
  useEffect(() => {
    let ignore = false;
    async function load() {
      if (!q || q.length < 3) {
        setItems([]);
        setCount(0);
        return;
      }
      try {
        const data = await fetchJSON<{
          items: SearchResult[];
          total: number;
          skip: number;
          limit: number;
        }>(`/api/search?term=${encodeURIComponent(q)}&sort=${sort}`);
        if (!ignore) {
          setItems(data.items);
          setCount(data.total);
          setPageSkip(data.skip);
        }
      } catch (e) {
        console.error('search fetch failed', e);
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, [q, sort]);

  const mergeQuery = (next: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(next).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    return params.toString();
  };

  const onSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const query = mergeQuery({ sort: e.target.value });
    router.push(`/search?${query}`);
  };

  if (!q) return null;

  if (items.length === 0) {
    return <p>No products matched &quot;{q}&quot;.</p>;
  }

  return (
    <div>
      <div className="flex justify-end mb-4" aria-live="polite">
        <p className="sr-only">{count} results found</p>
        <select
          aria-label="Sort results"
          className="border rounded px-2 py-1"
          defaultValue={sort}
          onChange={onSortChange}
        >
          <option value="relevance">Relevance</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        </select>
      </div>
      <ol
        role="list"
        start={pageSkip + 1}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        aria-live="polite"
      >
        {items.map(item => (
          <li key={item.id} className="list-none">
            <ProductCard product={item} highlightTerm={q} />
          </li>
        ))}
      </ol>
    </div>
  );
}

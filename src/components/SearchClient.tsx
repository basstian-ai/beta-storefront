'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ProductCard from './ProductCard';
import { fetchJSON } from '@/utils/fetchJSON';
import { mergeQueryString } from '@/utils/mergeQuery';
import SearchPager from './SearchPager';

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
  limit: number;
}

export default function SearchClient({ initial, q, sort, total, skip, limit }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [items, setItems] = useState(() => initial);
  const [count, setCount] = useState(total);
  const [pageSkip, setPageSkip] = useState(skip);
  const [pageLimit, setPageLimit] = useState(limit);

  // update local pagination state when URL changes
  useEffect(() => {
    const nextSkip = Number(searchParams.get('skip') ?? '0');
    const nextLimit = Number(searchParams.get('limit') ?? String(pageLimit));
    if (!Number.isNaN(nextSkip) && nextSkip !== pageSkip) {
      setPageSkip(nextSkip);
    }
    if (!Number.isNaN(nextLimit) && nextLimit !== pageLimit) {
      setPageLimit(nextLimit);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString()]);

  // refetch when query, sort or page changes
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
        }>(`/api/search?term=${encodeURIComponent(q)}&sort=${sort}&skip=${pageSkip}&limit=${pageLimit}`);
        if (!ignore) {
          setItems(data.items);
          setCount(data.total);
          setPageSkip(data.skip);
          setPageLimit(data.limit);
        }
      } catch (e) {
        console.error('search fetch failed', e);
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, [q, sort, pageSkip, pageLimit]);

  const mergeQuery = (next: Record<string, string | number>) => {
    return mergeQueryString(searchParams.toString(), next);
  };


  const onSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const query = mergeQuery({ sort: e.target.value, skip: 0 });
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
      <SearchPager total={count} skip={pageSkip} limit={pageLimit} />
    </div>
  );
}

'use client';

import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useSearchStatus } from '@/context/SearchStatusContext';
import { useRouter, useSearchParams } from 'next/navigation';
import ProductCard from './ProductCard';
import SearchResultsSkeleton from './SearchResultsSkeleton';
import { fetchJSON } from '@/utils/fetchJSON';
import { mergeQueryString } from '@/utils/mergeQuery';

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
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const { setMessage } = useSearchStatus();

  // Reset state when props change (navigating to new search)
  useEffect(() => {
    setItems(initial);
    setCount(total);
    setPageSkip(skip);
    setPageLimit(limit);
    setMessage(total ? `${total} results` : 'No results');
  }, [initial, total, skip, limit]);

  const fetchMore = useCallback(async () => {
    if (isLoadingMore) return;
    const nextSkip = pageSkip + pageLimit;
    if (nextSkip >= count) return;
    setIsLoadingMore(true);
    try {
      const data = await fetchJSON<{
        items: SearchResult[];
        total: number;
        skip: number;
        limit: number;
      }>(`/api/search?term=${encodeURIComponent(q)}&sort=${sort}&skip=${nextSkip}&limit=${pageLimit}`);
      setItems(prev => [...prev, ...data.items]);
      setCount(data.total);
      setPageSkip(data.skip);
      setPageLimit(data.limit);
      setMessage(data.total ? `${data.total} results` : 'No results');
    } catch (e) {
      console.error('search fetch failed', e);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, pageSkip, pageLimit, q, sort, count]);

  function debounce<A extends unknown[]>(fn: (...args: A) => void, delay: number) {
    let t: ReturnType<typeof setTimeout> | undefined;
    return (...args: A) => {
      if (t) clearTimeout(t);
      t = setTimeout(() => fn(...args), delay);
    };
  }

  const debouncedFetchMore = useMemo(() => debounce(fetchMore, 200), [fetchMore]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        debouncedFetchMore();
      }
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [debouncedFetchMore]);

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
        start={1}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        aria-live="polite"
      >
        {items.map(item => (
          <li key={item.id} className="list-none">
            <ProductCard product={item} highlightTerm={q} />
          </li>
        ))}
      </ol>
      {isLoadingMore && <SearchResultsSkeleton rows={pageLimit} />}
      {items.length < count ? (
        <div ref={sentinelRef} className="mt-4 text-center">
          <button
            onClick={fetchMore}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Load more
          </button>
        </div>
      ) : (
        <p className="mt-4 text-center text-sm text-gray-500">You’ve reached the end</p>
      )}
    </div>
  );
}

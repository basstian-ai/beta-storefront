'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useSearchStatus } from '@/contexts/SearchStatusContext';
import { useDebouncedCallback } from 'use-debounce';
import { mergeQueryString } from '@/utils/mergeQuery';

interface SearchFormProps {
  initialQuery?: string;
  initialSort?: string;
}

export default function SearchForm({ initialQuery = '', initialSort = 'relevance' }: SearchFormProps) {
  const [term, setTerm] = useState(initialQuery);
  const [sort, setSort] = useState(initialSort);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setMessage } = useSearchStatus();

  const pushQuery = useDebouncedCallback(
    (value: string) => {
      setMessage('Searching…');
      const params = new URLSearchParams(Array.from(searchParams.entries()));
      if (value.trim()) {
        params.set('q', value.trim());
      } else {
        params.delete('q');
      }
      if (sort && sort !== 'relevance') {
        params.set('sort', sort);
      } else {
        params.delete('sort');
      }
      const merged = mergeQueryString(params.toString(), { skip: 0 });
      router.push(`/search?${merged}`);
    },
    300
  );

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage('Searching…');
    pushQuery.flush();
    pushQuery.cancel();
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    if (term.trim()) {
      params.set('q', term.trim());
    } else {
      params.delete('q');
    }
    if (sort && sort !== 'relevance') {
      params.set('sort', sort);
    } else {
      params.delete('sort');
    }
    const merged = mergeQueryString(params.toString(), { skip: 0 });
    router.push(`/search?${merged}`);
  };

  return (
    <form onSubmit={onSubmit} role="search" className="flex gap-2">
      <input
        type="text"
        value={term}
        onChange={e => {
          setTerm(e.target.value);
          pushQuery(e.target.value);
        }}
        placeholder="Search..."
        aria-label="Search query"
        className="flex-grow border rounded px-3 py-2"
      />
      <select
        value={sort}
        onChange={e => setSort(e.target.value)}
        className="border rounded px-2"
      >
        <option value="relevance">Relevance</option>
        <option value="price-asc">Price: Low to High</option>
        <option value="price-desc">Price: High to Low</option>
      </select>
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        Search
      </button>
    </form>
  );
}

'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [term, setTerm] = useState(searchParams.get('q') ?? '');
  const pushQuery = useDebouncedCallback((value: string) => {
    const trimmed = value.trim();
    if (trimmed) {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    }
  }, 300);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleShortcut = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  useEffect(() => {
    setTerm(searchParams.get('q') ?? '');
  }, [searchParams]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    pushQuery.flush();
    pushQuery.cancel();
    const formData = new FormData(e.currentTarget);
    const q = (formData.get('q') as string | null)?.trim() ?? '';
    if (q) {
      router.push(`/search?q=${encodeURIComponent(q)}`);
    }
  };

  return (
    <form onSubmit={onSubmit} role="search" className="relative">
      <label htmlFor="navbar-search" className="sr-only">
        Search
      </label>
      <input
        id="navbar-search"
        name="q"
        ref={inputRef}
        type="text"
        className="w-full rounded-md border border-gray-300 bg-white bg-opacity-20 px-2 py-1 text-sm text-white placeholder-gray-300 focus:bg-opacity-100 focus:text-gray-900 focus:outline-none"
        placeholder="Search products…"
        value={term}
        onChange={e => {
          setTerm(e.target.value);
          pushQuery(e.target.value);
        }}
      />
      <button
        type="submit"
        className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white"
        aria-label="Search"
      >
        <MagnifyingGlassIcon className="h-5 w-5" />
      </button>
    </form>
  );
}

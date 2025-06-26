'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Combobox } from '@headlessui/react';
import { useSearchStatus } from '@/context/SearchStatusContext';
import { useProductSearch } from '@/hooks/useProductSearch';
import type { ProductSearchHit } from '@/lib/search';

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [term, setTerm] = useState(searchParams.get('q') ?? '');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const { setMessage } = useSearchStatus();
  const { data, isLoading } = useProductSearch({ q: term, perPage: 5 });
  const pushQuery = useDebouncedCallback((value: string) => {
    const trimmed = value.trim();
    if (trimmed) {
      setMessage('Searching…');
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    }
  }, 300);

  useEffect(() => {
    if (!term.trim()) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    if (data?.hits) {
      setSuggestions(data.hits.map((h: ProductSearchHit) => h.document.name));
      setOpen(true);
    } else if (isLoading) {
      setOpen(true);
    } else {
      setSuggestions([]);
      setOpen(true);
    }
  }, [data, term, isLoading]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleShortcut = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setOpen(false);
        inputRef.current?.blur();
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
    <Combobox
      value={term}
      onChange={value => {
        setTerm(value);
        pushQuery.cancel();
        pushQuery.flush();
        setOpen(false);
        const trimmed = value.trim();
        if (trimmed) {
          router.push(`/search?q=${encodeURIComponent(trimmed)}`);
        }
      }}
    >
      <form onSubmit={onSubmit} role="search" className="relative">
        <label htmlFor="navbar-search" className="sr-only">
          Search
        </label>
        <input
          id="navbar-search"
          name="q"
          ref={inputRef}
          type="text"
          className="w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-indigo-500"
          placeholder="Search products…"
          value={term}
          onChange={e => {
            setTerm(e.target.value);
            pushQuery(e.target.value);
          }}
          onFocus={() => suggestions.length && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 100)}
        />
        {term && (
          <button
            type="button"
            onClick={() => { setTerm(''); setSuggestions([]); setOpen(false); pushQuery.cancel(); }}
            className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="Clear search"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        )}
        <button
          type="submit"
          className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          aria-label="Search"
        >
          <MagnifyingGlassIcon className="h-5 w-5" />
        </button>
        {open && (
          <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-sm shadow-lg">
            {isLoading &&
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="px-3 py-2 text-gray-400 animate-pulse">
                  Loading...
                </div>
              ))}
            {!isLoading && suggestions.length === 0 && (
              <div className="px-3 py-2 text-gray-500">No results</div>
            )}
            {!isLoading &&
              suggestions.map(s => (
                <Combobox.Option
                  key={s}
                  value={s}
                  className={({ active }) => `cursor-pointer select-none px-3 py-1 ${active ? 'bg-indigo-600 text-white' : 'text-gray-900'}`}
                  onClick={() => {
                    pushQuery.flush();
                    setOpen(false);
                  }}
                >
                  {s}
                </Combobox.Option>
              ))}
          </Combobox.Options>
        )}
      </form>
    </Combobox>
  );
}

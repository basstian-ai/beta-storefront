'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Combobox } from '@headlessui/react';
import { useSearchStatus } from '@/context/SearchStatusContext';

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [term, setTerm] = useState(searchParams.get('q') ?? '');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const { setMessage } = useSearchStatus();
  const pushQuery = useDebouncedCallback((value: string) => {
    const trimmed = value.trim();
    if (trimmed) {
      setMessage('Searching…');
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    }
  }, 300);

  const fetchHints = useDebouncedCallback(async (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await fetch(
        `/api/search?s=${encodeURIComponent(trimmed)}&limit=5&onlyNames=true`
      );
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data.names ?? []);
        setOpen(true);
      }
    } catch (e) {
      console.error('hint fetch failed', e);
    }
  }, 300);
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
            fetchHints(e.target.value);
          }}
          onFocus={() => suggestions.length && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 100)}
        />
        {term && (
          <button
            type="button"
            onClick={() => { setTerm(''); setSuggestions([]); setOpen(false); pushQuery.cancel(); fetchHints.cancel(); }}
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
        {open && suggestions.length > 0 && (
          <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-sm shadow-lg">
            {suggestions.map(s => (
              <Combobox.Option
                key={s}
                value={s}
                className={({ active }) => `cursor-pointer select-none px-3 py-1 ${active ? 'bg-indigo-600 text-white' : 'text-gray-900'}`}
                onClick={() => { pushQuery.flush(); setOpen(false); }}
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

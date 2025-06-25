'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { ChangeEvent } from 'react';

export default function CategoryFilters({
  sortOptions,
}: {
  sortOptions: { value: string; label: string }[];
}) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const next = new URLSearchParams(params);
    next.set('sort', e.target.value);
    router.replace(`${pathname}?${next.toString()}`);
  };

  return (
    <div className="flex items-center gap-2 py-4">
      <label htmlFor="sort" className="text-sm font-medium">
        Sort by
      </label>
      <select
        id="sort"
        name="sort"
        defaultValue={params.get('sort') ?? ''}
        onChange={handleChange}
        className="border rounded px-2 py-1"
      >
        {sortOptions.map(o => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}


'use client';
import { useState } from 'react';
import { useProductFilters } from '@/store/productFilters';

interface Props {
  brands: string[];
}

export default function FiltersSidebar({ brands }: Props) {
  const { min, max, brands: selected, rating } = useProductFilters();
  const toggleBrand = useProductFilters((s) => s.toggleBrand);
  const setPrice = useProductFilters((s) => s.setPrice);
  const setRating = useProductFilters((s) => s.setRating);

  const [minInput, setMinInput] = useState(min ?? '');
  const [maxInput, setMaxInput] = useState(max ?? '');

  const applyPrice = () => {
    const m1 = minInput === '' ? null : Number(minInput);
    const m2 = maxInput === '' ? null : Number(maxInput);
    setPrice(isNaN(m1) ? null : m1, isNaN(m2) ? null : m2);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold mb-1">Brand</h3>
        {brands.map((b) => (
          <label key={b} className="block text-sm">
            <input
              type="checkbox"
              checked={selected.includes(b)}
              onChange={() => toggleBrand(b)}
              className="mr-2"
            />
            {b}
          </label>
        ))}
      </div>
      <div>
        <h3 className="font-semibold mb-1">Price</h3>
        <div className="flex gap-2">
          <input
            type="number"
            value={minInput}
            onChange={(e) => setMinInput(e.target.value)}
            placeholder="Min"
            className="border p-1 w-full"
          />
          <input
            type="number"
            value={maxInput}
            onChange={(e) => setMaxInput(e.target.value)}
            placeholder="Max"
            className="border p-1 w-full"
          />
          <button onClick={applyPrice} className="px-2 border rounded">
            Apply
          </button>
        </div>
      </div>
      <div>
        <h3 className="font-semibold mb-1">Rating</h3>
        <select
          value={rating ?? ''}
          onChange={(e) => setRating(e.target.value ? Number(e.target.value) : null)}
          className="border p-1"
        >
          <option value="">All</option>
          {[5,4,3,2,1].map((r) => (
            <option key={r} value={r}>{r} & up</option>
          ))}
        </select>
      </div>
    </div>
  );
}

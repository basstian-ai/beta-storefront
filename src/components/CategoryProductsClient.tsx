'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { z } from 'zod';
import { ProductSchema } from '@/bff/types';
import { useProductFilters } from '@/store/productFilters';
import SortDropdown from './SortDropdown';
import FiltersSidebar from './FiltersSidebar';
import ProductCardSkeleton from './ProductCardSkeleton';
import Link from 'next/link';
import Image from 'next/image';

export type Product = z.infer<typeof ProductSchema>;

function filterProducts(products: Product[], state: {brands: string[]; min: number | null; max: number | null; rating: number | null; sort: string;}) {
  let result = products;
  if (state.brands.length) {
    result = result.filter(p => p.brand && state.brands.includes(p.brand));
  }
  if (state.min !== null) {
    result = result.filter(p => p.price >= state.min!);
  }
  if (state.max !== null) {
    result = result.filter(p => p.price <= state.max!);
  }
  if (state.rating !== null) {
    result = result.filter(p => (p.rating || 0) >= state.rating!);
  }
  switch (state.sort) {
    case 'price_desc':
      result = [...result].sort((a,b)=>b.price-a.price);
      break;
    case 'price_asc':
      result = [...result].sort((a,b)=>a.price-b.price);
      break;
    case 'newest':
      result = [...result].sort((a,b)=>(b.id||0)-(a.id||0));
      break;
    default:
      result = [...result];
  }
  return result;
}

const ProductCard = ({ product }: { product: Product }) => (
  <div className="border p-4 rounded-lg flex flex-col">
    {product.thumbnail && (
      <Image src={product.thumbnail} alt={product.title} width={300} height={300} className="object-cover mb-2" />
    )}
    <h3 className="font-semibold mb-1">{product.title}</h3>
    <p className="text-sm mb-2">${product.price.toFixed(2)}</p>
    <Link href={`/product/${product.slug}`} className="text-blue-600 underline mt-auto">View</Link>
  </div>
);

export default function CategoryProductsClient({ products, brands, categoryName }: { products: Product[]; brands: string[]; categoryName: string }) {
  const [display, setDisplay] = useState<Product[]>(products);
  const [loading, setLoading] = useState(false);
  const state = useProductFilters();
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // init from query on mount
  useEffect(() => {
    state.initializeFromQuery(params);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // update URL when state changes
  useEffect(() => {
    const p = new URLSearchParams();
    state.brands.forEach(b => p.append('brand', b));
    if (state.min !== null) p.set('min', String(state.min));
    if (state.max !== null) p.set('max', String(state.max));
    if (state.rating !== null) p.set('rating', String(state.rating));
    if (state.sort && state.sort !== 'relevance') p.set('sort', state.sort);
    router.replace(`${pathname}?${p.toString()}`, { scroll: false });
  }, [state.brands, state.min, state.max, state.rating, state.sort, pathname, router]);

  // recompute products when filters change
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setDisplay(
        filterProducts(products, {
          brands: state.brands,
          min: state.min,
          max: state.max,
          rating: state.rating,
          sort: state.sort,
        })
      );
      setLoading(false);
    }, 200);
    return () => clearTimeout(timer);
  }, [products, state.brands, state.min, state.max, state.rating, state.sort]);

  return (
    <div className="flex gap-6">
      <aside className="hidden md:block w-60">
        <FiltersSidebar brands={brands} />
      </aside>
      <main className="flex-1">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Category: {categoryName}</h1>
          <SortDropdown />
        </div>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : display.length === 0 ? (
          <p>No products found.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {display.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

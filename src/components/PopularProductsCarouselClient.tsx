'use client';
import { useRef, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { PopularProduct } from '@/utils/getPopularProducts';
import ProductCard, { type Product } from './ProductCard';
import { slugify } from '@/lib/utils';

type Props = { products: PopularProduct[] };

export default function PopularProductsCarouselClient({ products }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const updateArrows = () => {
    const el = containerRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 0);
    setCanNext(el.scrollWidth > el.clientWidth + el.scrollLeft + 1);
  };

  useEffect(() => {
    updateArrows();
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateArrows);
    window.addEventListener('resize', updateArrows);
    return () => {
      el.removeEventListener('scroll', updateArrows);
      window.removeEventListener('resize', updateArrows);
    };
  }, []);

  const scrollBy = (offset: number) => {
    containerRef.current?.scrollBy({ left: offset, behavior: 'smooth' });
  };

  const normalize = (p: PopularProduct): Product => ({
    id: p.id,
    title: p.title,
    slug: slugify(p.title),
    description: '',
    price: p.price,
    discountPercentage: p.discountPercentage,
    rating: p.rating,
    stock: 0,
    brand: '',
    category: { name: '', slug: '' },
    thumbnail: p.thumbnail,
    images: [],
    effectivePrice:
      p.discountPercentage > 0
        ? { amount: p.price * (1 - p.discountPercentage / 100) }
        : undefined,
  });

  return (
    <div className="relative" role="region" aria-label="Popular products">
      <div
        ref={containerRef}
        id="popular-carousel"
        className="flex overflow-x-auto gap-4 scroll-smooth snap-x snap-mandatory pb-4"
      >
        {products.map((product) => (
          <div key={product.id} className="w-64 shrink-0 px-2 snap-start">
            <ProductCard product={normalize(product)} />
          </div>
        ))}
      </div>
      {canPrev && (
        <button
          type="button"
          onClick={() => scrollBy(-250)}
          aria-controls="popular-carousel"
          className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-700 p-2 rounded-full shadow"
        >
          <span className="sr-only">Previous products</span>
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}
      {canNext && (
        <button
          type="button"
          onClick={() => scrollBy(250)}
          aria-controls="popular-carousel"
          className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-700 p-2 rounded-full shadow"
        >
          <span className="sr-only">Next products</span>
          <ChevronRight className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}

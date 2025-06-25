'use client';
import { useRef, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { PopularProduct } from '@/utils/getPopularProducts';
import ProductCard, { type Product } from './ProductCard';
import { slugify } from '@/lib/utils';

type Props = { products: PopularProduct[] };
const visibleCards = 3;

export default function PopularProductsCarouselClient({ products }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(products.length > visibleCards);

  useEffect(() => {
    if (products.length <= visibleCards) {
      setCanPrev(false);
      setCanNext(false);
      return;
    }
    const el = containerRef.current;
    if (!el) return;
    const first = el.firstElementChild;
    const last = el.lastElementChild;
    if (!first || !last) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target === first) setCanPrev(!entry.isIntersecting);
          if (entry.target === last) setCanNext(!entry.isIntersecting);
        });
      },
      { root: el, threshold: 0.9 }
    );
    observer.observe(first);
    observer.observe(last);
    return () => observer.disconnect();
  }, [products.length]);

  const scrollBy = (offset: number) => {
    containerRef.current?.scrollBy({ left: offset, behavior: 'smooth' });
  };

  const normalize = (p: PopularProduct): Product & { blurDataURL: string } => ({
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
    blurDataURL: p.blurDataURL,
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
      <button
        type="button"
        onClick={() => scrollBy(-250)}
        aria-controls="popular-carousel"
        aria-disabled={!canPrev}
        className={`hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-700 p-2 rounded-full shadow ${!canPrev ? 'opacity-40 pointer-events-none' : ''}`}
      >
        <span className="sr-only">Previous products</span>
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => scrollBy(250)}
        aria-controls="popular-carousel"
        aria-disabled={!canNext}
        className={`hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-700 p-2 rounded-full shadow ${!canNext ? 'opacity-40 pointer-events-none' : ''}`}
      >
        <span className="sr-only">Next products</span>
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}

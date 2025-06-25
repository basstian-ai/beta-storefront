'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import type { PopularProduct } from '@/utils/getPopularProducts';

type Props = { products: PopularProduct[] };

export default function PopularProductsCarouselClient({ products }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollBy = (offset: number) => {
    containerRef.current?.scrollBy({ left: offset, behavior: 'smooth' });
  };

  return (
    <div className="relative" role="region" aria-label="Popular products">
      <div
        ref={containerRef}
        id="popular-carousel"
        className="flex overflow-x-auto gap-4 scroll-smooth snap-x snap-mandatory pb-4"
      >
        {products.map((product, idx) => {
          const discounted = product.discountPercentage > 0;
          const finalPrice = discounted
            ? product.price * (1 - product.discountPercentage / 100)
            : product.price;
          return (
            <Link
              key={product.id}
              href={`/product/${product.id}`}
              className="min-w-[200px] flex-shrink-0 snap-start border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-sm hover:shadow-md bg-white dark:bg-gray-800 p-4"
            >
              <div className="w-full aspect-square relative mb-2">
                <Image
                  src={product.thumbnail}
                  alt={product.title}
                  fill
                  sizes="(max-width:768px) 50vw, 200px"
                  className="object-cover rounded"
                  priority={idx === 0}
                />
              </div>
              <h3 className="font-medium text-sm mb-1 line-clamp-2">{product.title}</h3>
              <div className="text-sm font-semibold flex items-center gap-1">
                {discounted && (
                  <span className="text-gray-500 line-through mr-1">
                    ${product.price.toFixed(2)}
                  </span>
                )}
                <span>${finalPrice.toFixed(2)}</span>
              </div>
              <div className="flex items-center text-yellow-500 text-xs mt-1">
                <Star className="h-4 w-4 fill-yellow-500" />
                <span className="ml-1">{product.rating.toFixed(1)}</span>
              </div>
            </Link>
          );
        })}
      </div>
      <button
        type="button"
        onClick={() => scrollBy(-200)}
        aria-controls="popular-carousel"
        className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-700 p-2 rounded-full shadow"
      >
        <span className="sr-only">Previous</span>
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => scrollBy(200)}
        aria-controls="popular-carousel"
        className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-700 p-2 rounded-full shadow"
      >
        <span className="sr-only">Next</span>
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}

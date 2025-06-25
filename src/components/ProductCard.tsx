import Link from 'next/link';
import Image from 'next/image';
import { z } from 'zod';
import { ProductSchema } from '@/bff/types';

export type Product = z.infer<typeof ProductSchema>;

import { highlight } from '@/utils/highlight';

interface ProductCardProps {
  product: Product;
  highlightTerm?: string;
}

export default function ProductCard({ product, highlightTerm }: ProductCardProps) {
  return (
    <div className="bg-white dark:bg-slate-800 shadow-md p-4 rounded-lg flex flex-col justify-between">
      <div>
        <Link href={`/product/${product.slug}`} className="group">
          {product.thumbnail && (
            <div className="aspect-square w-full relative overflow-hidden rounded-lg bg-gray-200">
              <Image
                src={product.thumbnail}
                alt={product.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                className="object-cover object-center group-hover:opacity-75"
              />
            </div>
          )}
          <h3 className="mt-4 text-lg font-semibold text-gray-900 group-hover:text-blue-600">
            {highlight(product.title, highlightTerm ?? '')}
          </h3>
        </Link>
        <p className="mt-1 text-sm text-gray-600 h-10 overflow-hidden text-ellipsis">
          {product.description}
        </p>
      </div>
      <div>
        <div className="mt-2 flex items-baseline gap-x-2">
          <p className="text-xl font-bold text-gray-900">
            {`$${product.effectivePrice?.amount.toFixed(2) ?? product.price.toFixed(2)}`}
          </p>
          {product.effectivePrice && product.effectivePrice.amount < product.price && (
            <span className="text-sm text-red-500 line-through">{`$${product.price.toFixed(2)}`}</span>
          )}
        </div>
        <Link
          href={`/product/${product.slug}`}
          className="mt-3 block text-center w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}

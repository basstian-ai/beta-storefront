// src/app/category/[slug]/page.tsx
import { getProducts, getCategories } from '@/bff/services';
import { ProductSchema } from '@/bff/types';
import Link from 'next/link';
import { z } from 'zod';

// ProductCard Component (can be moved to src/components later)
const ProductCard = ({ product }: { product: z.infer<typeof ProductSchema> }) => (
  <div className="border p-4 rounded-lg shadow hover:shadow-xl transition-shadow flex flex-col justify-between">
    <div>
      <Link href={`/product/${product.slug}`} className="group"> {/* Use product.slug */}
        {product.thumbnail && (
          <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-200 xl:aspect-w-7 xl:aspect-h-8">
            <img
              src={product.thumbnail}
              alt={product.title}
              className="h-full w-full object-cover object-center group-hover:opacity-75"
            />
          </div>
        )}
        <h3 className="mt-4 text-lg font-semibold text-gray-900 group-hover:text-blue-600">{product.title}</h3>
      </Link>
      <p className="mt-1 text-sm text-gray-600 h-10 overflow-hidden text-ellipsis">{product.description}</p>
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
      <Link href={`/product/${product.slug}`} className="mt-3 block text-center w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"> {/* Use product.slug */}
        View Details
      </Link>
    </div>
  </div>
);

export async function generateStaticParams() {
  try {
    const categoryStrings = await getCategories();
    return categoryStrings.map((catName) => ({
      slug: catName.toLowerCase().replace(/\s+/g, '-'),
    }));
  } catch (error) {
    console.error("Failed to generate static params for category pages:", error);
    return [];
  }
}

// Removed CategoryPageProps interface

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams?: {
    brand?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: 'price-asc' | 'price-desc' | 'newest';
  };
}) {
  const { slug } = params;
  const categoryApiName = slug;

  const { items: products, total } = await getProducts({
    category: categoryApiName,
    limit: 100,
  });

  const humanReadableCategoryName = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-semibold mb-4">Category: {humanReadableCategoryName}</h1>
        <p>No products found in this category.</p>
        <Link href="/" className="mt-4 inline-block bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
          Back to Home
        </Link>
      </div>
    );
  }

  const brands = Array.from(new Set(products.map(p => p.brand).filter(Boolean as (value: any) => value is string).sort()));

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Category: {humanReadableCategoryName}</h1>
      <p className="text-gray-600 mb-6">Showing {products.length} of {total} products. (Sorting/filtering is placeholder)</p>

      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-1/4 lg:w-1/5">
          <h2 className="text-xl font-semibold mb-4">Filters</h2>
          <div className="mb-4">
            <h3 className="font-medium mb-2">Brand</h3>
            {brands.map(brand => (
              <label key={brand} className="flex items-center space-x-2 text-sm">
                <input type="checkbox" className="form-checkbox rounded text-blue-600 focus:ring-blue-500" value={brand} />
                <span>{brand}</span>
              </label>
            ))}
            {brands.length === 0 && <p className="text-sm text-gray-500">No brands to filter.</p>}
          </div>

          <div className="mb-4">
            <h3 className="font-medium mb-2">Price Range</h3>
            <input type="range" min="0" max="2000" defaultValue="1000" className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer form-range"/>
            <div className="flex justify-between text-sm text-gray-600 mt-1">
              <span>$0</span>
              <span>$2000</span>
            </div>
          </div>

          <button type="button" className="w-full bg-gray-700 text-white py-2 px-4 rounded hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
            Apply Filters (UI Only)
          </button>
        </aside>

        <main className="w-full md:w-3/4 lg:w-4/5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Products</h2>
            <select className="form-select rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50">
              <option value="default">Default Sort</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="newest">Newest</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

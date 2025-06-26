import { Suspense } from 'react';
import { getCategories, getProducts } from '@/bff/services';
import CategoryFilter from '../[slug]/CategoryFilter';
import CategoryClient from '../[slug]/CategoryClient';

export default async function CategoryGrid({
  slug,
}: {
  slug: string | null;
}) {
  const [productData, categories] = await Promise.all([
    getProducts({ category: slug ?? undefined, limit: 0 }),
    getCategories(),
  ]);

  const categoryName = slug
    ? categories.find((c) => c.slug === slug)?.name ?? slug.replace(/-/g, ' ')
    : 'All products';

  const brands = Array.from(
    new Set(
      productData.items
        .map((p) => p.brand)
        .filter((b): b is string => typeof b === 'string' && b.length > 0)
    )
  ).sort();

  const products = productData.items;

  if (products.length === 0) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-semibold mb-4">Category: {categoryName}</h1>
        <p>No products found in this category.</p>
      </div>
    );
  }

  return (
    <>
      <Suspense fallback={null}>
        <CategoryFilter />
      </Suspense>
      <CategoryClient products={products} brands={brands} categoryName={categoryName} />
    </>
  );
}

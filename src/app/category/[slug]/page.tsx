import { Suspense } from 'react'
import Link from 'next/link'
import { getCategories, getProducts } from '@/bff/services'
import CategoryClient from './CategoryClient'
import CategoryFilter from './CategoryFilterClient'

export async function generateStaticParams() {
  const categories = await getCategories()
  return categories.map(c => ({ slug: c.slug }))
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const [productData, categories] = await Promise.all([
    getProducts({ category: params.slug, limit: 0 }),
    getCategories(),
  ])

  const category = categories.find(c => c.slug === params.slug)
  const categoryName = category?.name ?? params.slug.replace(/-/g, ' ')

  const brands = Array.from(
    new Set(
      productData.items
        .map(p => p.brand)
        .filter((b): b is string => typeof b === 'string' && b.length > 0)
    )
  ).sort()

  const products = productData.items

  if (products.length === 0) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-semibold mb-4">Category: {categoryName}</h1>
        <p>No products found in this category.</p>
        <Link href="/" className="mt-4 inline-block bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
          Back to Home
        </Link>
      </div>
    )
  }

  return (
    <>
      <Suspense fallback={null}>
        <CategoryFilter />
      </Suspense>
      <CategoryClient products={products} brands={brands} categoryName={categoryName} />
    </>
  )
}

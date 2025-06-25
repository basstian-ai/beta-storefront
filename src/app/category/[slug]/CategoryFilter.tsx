'use client'
import { useEffect } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useProductFilters } from '@/store/productFilters'

export default function CategoryFilter() {
  const params = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const initializeFromQuery = useProductFilters((s) => s.initializeFromQuery)
  const { brands, min, max, rating, sort } = useProductFilters()

  useEffect(() => {
    initializeFromQuery(params)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const q = new URLSearchParams()
    brands.forEach((b) => q.append('brand', b))
    if (min !== null) q.set('min', String(min))
    if (max !== null) q.set('max', String(max))
    if (rating !== null) q.set('rating', String(rating))
    if (sort && sort !== 'relevance') q.set('sort', sort)
    const query = q.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }, [brands, min, max, rating, sort, pathname, router])

  return null
}

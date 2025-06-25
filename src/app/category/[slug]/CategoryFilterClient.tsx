'use client'
import dynamic from 'next/dynamic'

const CategoryFilter = dynamic(() => import('./CategoryFilter'), { ssr: false })
export default CategoryFilter

'use client';
import Link from 'next/link';

export default function CategoryNotFound() {
  return (
    <div className="mx-auto mt-24 text-center space-y-4">
      <h1 className="text-2xl font-semibold">Category not found</h1>
      <p className="text-gray-600">We couldn’t find that category.</p>
      <Link href="/" className="btn-primary">Go home</Link>
    </div>
  );
}

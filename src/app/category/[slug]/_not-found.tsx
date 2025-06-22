import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Category not found',
};

export default function CategoryNotFound() {
  return (
    <section className="mx-auto max-w-md py-24 text-center">
      <h1 className="text-2xl font-bold mb-4">Category not found</h1>
      <p className="mb-6">We couldn&apos;t find that category.</p>
      <Link href="/" className="btn-primary">Back to home</Link>
    </section>
  );
}

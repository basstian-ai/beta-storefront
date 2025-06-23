import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page not found',
};

export default function NotFound404() {
  return (
    <section className="mx-auto max-w-md py-24 text-center">
      <h1 className="text-3xl font-bold mb-4">404 – Not found</h1>
      <p className="mb-6">
        Sorry, we couldn&rsquo;t find that page.
      </p>
      <Link href="/" className="btn-primary">
        Back to home
      </Link>
    </section>
  );
}


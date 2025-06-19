import { Suspense } from 'react';
import SearchBar from '@/components/SearchBar';

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-12 text-center">
      <h1 className="text-3xl font-bold mb-4">Page not found</h1>
      <p className="mb-6">Sorry, we couldn&apos;t find what you were looking for.</p>
      <Suspense fallback={null}>
        <div className="max-w-sm mx-auto">
          <SearchBar />
        </div>
      </Suspense>
    </div>
  );
}

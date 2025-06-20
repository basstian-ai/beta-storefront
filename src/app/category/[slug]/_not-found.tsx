import { Suspense } from 'react';
import SearchBar from '@/components/SearchBar';

export default function CategoryNotFound() {
  return (
    <div className="container mx-auto px-4 py-12 text-center">
      <h1 className="text-2xl font-bold mb-4">Category not found</h1>
      <p className="mb-6">We couldn't find that category.</p>
      <Suspense fallback={null}>
        <div className="max-w-sm mx-auto">
          <SearchBar />
        </div>
      </Suspense>
    </div>
  );
}

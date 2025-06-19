import { Suspense } from 'react';
import SearchForm from '@/components/SearchForm';
import SearchResults from '@/components/SearchResults';
import SearchResultsSkeleton from '@/components/SearchResultsSkeleton';

export default function SearchPage({ searchParams }: { searchParams?: { q?: string } }) {
  const query = searchParams?.q ?? '';
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Search Products</h1>
      <div className="max-w-xl mx-auto mb-8">
        <SearchForm initialQuery={query} />
      </div>
      <Suspense fallback={<SearchResultsSkeleton />}> 
        <SearchResults query={query} />
      </Suspense>
    </div>
  );
}

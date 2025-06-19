import { Suspense } from 'react';
import SearchForm from '@/components/SearchForm';
import SearchResults from '@/components/SearchResults';
import SearchResultsSkeleton from '@/components/SearchResultsSkeleton';

export default async function SearchPage({
  searchParams,
}: {
  searchParams?: { q?: string; sort?: string };
}) {
  const query = searchParams?.q ?? '';
  const sort = (searchParams?.sort as 'relevance' | 'price-asc' | 'price-desc') ?? 'relevance';
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Search Products</h1>
      <div className="max-w-xl mx-auto mb-8">
        <SearchForm initialQuery={query} initialSort={sort} />
      </div>
      <Suspense fallback={<SearchResultsSkeleton />}>
        <SearchResults query={query} sort={sort} />
      </Suspense>
    </div>
  );
}

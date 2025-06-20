import { Suspense } from 'react';
import SearchForm from '@/components/SearchForm';
import SearchResults from '@/components/SearchResults';
import SearchResultsSkeleton from '@/components/SearchResultsSkeleton';
import { DEFAULT_LIMIT } from '@/bff/services';

export default async function SearchPage({
  searchParams,
}: {
  searchParams?: { q?: string; sort?: string; skip?: string; limit?: string };
}) {
  const query = searchParams?.q ?? '';
  const sort = (searchParams?.sort as 'relevance' | 'price-asc' | 'price-desc') ?? 'relevance';
  const skipParam = Number(searchParams?.skip ?? '0');
  const limitParam = Number(searchParams?.limit ?? String(DEFAULT_LIMIT));
  const skip = Number.isNaN(skipParam) ? 0 : skipParam;
  const limit = Number.isNaN(limitParam) ? DEFAULT_LIMIT : limitParam;
  return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Search Products</h1>
        <div className="max-w-xl mx-auto mb-8">
          <SearchForm initialQuery={query} initialSort={sort} />
        </div>
        <Suspense fallback={<SearchResultsSkeleton />}>
          <SearchResults query={query} sort={sort} skip={skip} limit={limit} />
        </Suspense>
      </div>
  );
}

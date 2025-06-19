import { searchProducts } from '@/bff/services';
import SearchClient from './SearchClient';

interface SearchResultsProps {
  query: string;
  sort: 'relevance' | 'price-asc' | 'price-desc';
}

export default async function SearchResults({ query, sort }: SearchResultsProps) {
  if (!query || query.length < 3) {
    return (
      <SearchClient initial={[]} q={query} sort={sort} total={0} skip={0} limit={0} />
    );
  }

  const { items, total, skip, limit } = await searchProducts(query, sort);

  return (
    <SearchClient
      initial={items}
      q={query}
      sort={sort}
      total={total}
      skip={skip}
      limit={limit}
    />
  );
}

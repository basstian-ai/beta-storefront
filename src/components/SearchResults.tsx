import { searchProducts } from '@/bff/services';
import SearchClient from './SearchClient';

interface SearchResultsProps {
  query: string;
  sort: 'relevance' | 'price-asc' | 'price-desc';
}

export default async function SearchResults({ query, sort }: SearchResultsProps) {
  if (!query || query.length < 3) {
    return <SearchClient initial={[]} q={query} sort={sort} total={0} />;
  }

  const { items, total } = await searchProducts(query, sort);

  return <SearchClient initial={items} q={query} sort={sort} total={total} />;
}

import { searchProducts } from '@/bff/services';
import SearchClient from './SearchClient';

interface SearchResultsProps {
  query: string;
  sort: 'relevance' | 'price-asc' | 'price-desc';
  skip: number;
  limit: number;
}

export default async function SearchResults({ query, sort, skip, limit }: SearchResultsProps) {
  if (!query || query.length < 3) {
    return (
      <SearchClient initial={[]} q={query} sort={sort} total={0} skip={skip} limit={limit} />
    );
  }

  const { items, total, skip: s, limit: l } = await searchProducts(query, sort, skip, limit);

  return (
    <SearchClient
      initial={items}
      q={query}
      sort={sort}
      total={total}
      skip={s}
      limit={l}
    />
  );
}

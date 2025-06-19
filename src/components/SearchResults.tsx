import { searchProducts } from '@/bff/services';
import ProductCard from './ProductCard';

interface SearchResultsProps {
  query: string;
}

export default async function SearchResults({ query }: SearchResultsProps) {
  if (!query || query.length < 3) {
    return null;
  }

  const { items, total } = await searchProducts(query);

  if (items.length === 0) {
    return <p>No products matched &quot;{query}&quot;.</p>;
  }

  return (
    <>
      <h2 className="text-2xl font-semibold mb-4">
        Results for &quot;{query}&quot; ({total} found)
      </h2>
      <ul role="list" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map(product => (
          <li key={product.id}>
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
    </>
  );
}

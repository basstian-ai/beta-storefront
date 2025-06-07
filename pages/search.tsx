import { GetServerSidePropsContext } from 'next';
import Layout from '@/components/Layout';
import BreadcrumbNav from '@/components/BreadcrumbNav';
import ProductList from '@/components/ProductList';
import { fetchCategories, fetchSearchResults, Product } from '@/lib/api';
import type { Category } from '@/types';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

interface SearchPageProps {
  initialResults: Product[];
  categories: Category[];
  query: string;
  error?: string | null;
}

export default function SearchPage({ initialResults, categories, query, error }: SearchPageProps) {
  const router = useRouter();
  const [results, setResults] = useState<Product[]>(initialResults);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(error || null);

  const currentQuery = typeof router.query.q === 'string' ? router.query.q : query;

  useEffect(() => {
    if (currentQuery === query) return;
    setIsLoading(true);
    fetchSearchResults(currentQuery)
      .then(data => {
        setResults(data);
        setErrorMsg(null);
      })
      .catch(() => setErrorMsg('Failed to load search results.'))
      .finally(() => setIsLoading(false));
  }, [currentQuery, query]);

  return (
    <Layout categories={categories}>
      <BreadcrumbNav />
      <h1>Search results for "{currentQuery}"</h1>
      {isLoading && <p>Loading...</p>}
      {errorMsg && <p>{errorMsg}</p>}
      {!isLoading && !errorMsg && results.length === 0 && <p>No results found.</p>}
      {!isLoading && !errorMsg && results.length > 0 && <ProductList products={results} />}
    </Layout>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const qParam = typeof context.query.q === 'string' ? context.query.q : '';
  let results: Product[] = [];
  let categories: Category[] = [];
  let error: string | null = null;
  try {
    [results, categories] = await Promise.all([
      qParam ? fetchSearchResults(qParam) : Promise.resolve([]),
      fetchCategories(),
    ]);
  } catch (err) {
    console.error('Error fetching search data:', err);
    error = 'Failed to load search results.';
  }
  return { props: { initialResults: results, categories, query: qParam, error } };
}


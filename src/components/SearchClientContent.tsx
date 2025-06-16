'use client'; // SearchClientContent is a client component

import { Fragment, useEffect, useState, useCallback } from 'react';
import { Combobox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon, MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import Link from 'next/link';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { ProductSchema, ServiceProductsResponseSchema } from '@/bff/types';
import { z } from 'zod';
import ProductCardSkeleton from './ProductCardSkeleton'; // Import shared skeleton

// Debounce function
function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: Parameters<F>) => {
    if (timeout !== null) {
      clearTimeout(timeout);
      timeout = null;
    }
    timeout = setTimeout(() => func(...args), waitFor);
  };

  return debounced as (...args: Parameters<F>) => ReturnType<F>;
}

type Product = z.infer<typeof ProductSchema>;

// Renamed from SearchPage to SearchContent, now SearchClientContent
export default function SearchClientContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams(); // To read initial query from URL

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [query, setQuery] = useState(searchParams?.get('query') || ''); // Initialize with URL query if present
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [initialProducts, setInitialProducts] = useState<Product[]>([]);
  const [totalResults, setTotalResults] = useState(0);

  const performSearch = async (searchTerm: string, isInitialLoad = false) => {
    if (searchTerm.length < 3) {
      setFilteredProducts([]);
      if (!isInitialLoad) setInitialProducts([]); // Clear initial results if query becomes too short
      if (!isInitialLoad) setTotalResults(0);
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`/api/search?term=${encodeURIComponent(searchTerm)}`);
      if (!response.ok) {
        throw new Error('Search request failed');
      }
      const data: z.infer<typeof ServiceProductsResponseSchema> = await response.json();
      setFilteredProducts(data.items); // For combobox suggestions
      if (isInitialLoad || searchTerm === query) { // Update main list if it's initial load or current primary query
        setInitialProducts(data.items);
        setTotalResults(data.total);
      }
    } catch (error) {
      console.error('Failed to fetch search results:', error);
      setFilteredProducts([]);
      if (isInitialLoad || searchTerm === query) {
        setInitialProducts([]);
        setTotalResults(0);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced version of performSearch for combobox input changes
  const debouncedSearch = useCallback(debounce(performSearch, 300), [query]); // Added query to dependency array

  // Effect for handling initial query from URL & subsequent primary searches
  useEffect(() => {
    const initialQuery = searchParams?.get('query');
    if (initialQuery && initialQuery.length >=3) {
      setQuery(initialQuery); // Set the query state for the input field
      performSearch(initialQuery, true); // Perform initial search
    } else {
      setInitialProducts([]); // Clear results if no valid initial query
      setTotalResults(0);
    }
  }, [searchParams]);


  // Handler for when the user types in the main search input field
  // This updates the URL and triggers the useEffect above.
  const handlePrimaryQueryChange = (newQuery: string) => {
    setQuery(newQuery); // Update input field immediately

    // Update URL params
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    if (!newQuery.trim()) {
      current.delete("query");
    } else {
      current.set("query", newQuery);
    }
    const search = current.toString();
    const newUrl = `${pathname}${search ? `?${search}` : ""}`;
    router.push(newUrl, { scroll: false }); // Update URL, triggers useEffect for search

    // For combobox suggestions, if different from primary search logic
    if (newQuery.length >= 3) {
        debouncedSearch(newQuery, false); // Get suggestions
    } else {
        setFilteredProducts([]); // Clear suggestions
    }
  };

  // Product Card (similar to category page, could be a shared component)
  const ProductCard = ({ product }: { product: Product }) => (
    <div className="border p-4 rounded-lg shadow hover:shadow-xl transition-shadow flex flex-col justify-between">
      <div>
        <Link href={`/product/${product.slug}`} className="group">
          {product.thumbnail && (
            <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-200 xl:aspect-w-7 xl:aspect-h-8">
              <img src={product.thumbnail} alt={product.title} className="h-full w-full object-cover object-center group-hover:opacity-75"/>
            </div>
          )}
          <h3 className="mt-4 text-lg font-semibold text-gray-900 group-hover:text-blue-600">{product.title}</h3>
        </Link>
        <p className="mt-1 text-sm text-gray-600 h-10 overflow-hidden text-ellipsis">{product.description}</p>
      </div>
      <div>
        <div className="mt-2 flex items-baseline gap-x-2">
          <p className="text-xl font-bold text-gray-900">
            {`$${product.effectivePrice?.amount.toFixed(2) ?? product.price.toFixed(2)}`}
          </p>
          {product.effectivePrice && product.effectivePrice.amount < product.price && (
            <span className="text-sm text-red-500 line-through">{`$${product.price.toFixed(2)}`}</span>
          )}
        </div>
        <Link href={`/product/${product.slug}`} className="mt-3 block text-center w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
          View Details
        </Link>
      </div>
    </div>
  );


  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Search Products</h1>

      {/* Combobox for search input and suggestions */}
      <div className="max-w-xl mx-auto mb-8">
        <Combobox value={selectedProduct} onChange={(product) => {
          if (product && product.slug) {
            setSelectedProduct(product);
            router.push(`/product/${product.slug}`);
          }
        }}>
          <div className="relative mt-1">
            <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-300 sm:text-sm">
              <MagnifyingGlassIcon className="pointer-events-none absolute top-3.5 left-4 h-5 w-5 text-gray-400" aria-hidden="true" />
              <Combobox.Input
                className="w-full border-none py-3 pl-11 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
                placeholder="Search for products (e.g. iPhone, laptop)..."
                displayValue={(product: Product | null) => product?.title || query}
                onChange={(event) => handlePrimaryQueryChange(event.target.value)}
              />
              <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </Combobox.Button>
            </div>
            <Transition
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
              afterLeave={() => { if(query.length < 3) setFilteredProducts([])}}
            >
              <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {isLoading && <div className="relative cursor-default select-none py-2 px-4 text-gray-700">Loading...</div>}
                {!isLoading && filteredProducts.length === 0 && query.length >= 3 && (
                  <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                    No products found for "{query}".
                  </div>
                )}
                {!isLoading && filteredProducts.map((product) => (
                  <Combobox.Option
                    key={product.id}
                    className={({ active }) =>
                      `relative cursor-default select-none py-2 pl-10 pr-4 ${
                        active ? 'bg-blue-600 text-white' : 'text-gray-900'
                      }`
                    }
                    value={product}
                  >
                    {({ selected, active }) => (
                      <>
                        <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                          {product.title}
                        </span>
                        {selected ? (
                          <span className={`absolute inset-y-0 left-0 flex items-center pl-3 ${active ? 'text-white' : 'text-blue-600'}`}>
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Combobox.Option>
                ))}
              </Combobox.Options>
            </Transition>
          </div>
        </Combobox>
      </div>

      {/* Display area for initial search results based on URL query */}
      {/* This section now handles its own loading skeleton for subsequent searches */}
      {query && query.length >= 3 && ( // Show results area if there's an active query
        <div>
          <h2 className="text-2xl font-semibold mb-4">
            Results for "{query}" ({isLoading ? '...' : totalResults} found)
          </h2>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, index) => ( // Display 4 skeletons for search
                <ProductCardSkeleton key={index} />
              ))}
            </div>
          ) : initialProducts.length === 0 ? (
            <p>No products found for this search term.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {initialProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
          {/* TODO: Pagination if totalResults > initialProducts.length */}
        </div>
      )}
    </div>
  );
}

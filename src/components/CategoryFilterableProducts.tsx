'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { z } from 'zod';
import { ProductSchema, SortOption, AllSortOptions } from '@/bff/types';
import { getProducts, ServiceProductsResponseSchema } from '@/bff/services';
import { buildProductFilterQueryString } from '@/lib/filterUtils';
import ProductCardSkeleton from './ProductCardSkeleton'; // Import shared skeleton

type Product = z.infer<typeof ProductSchema>;

// ProductCard Component
const ProductCard = ({ product }: { product: Product }) => (
  <div className="border p-4 rounded-lg shadow hover:shadow-xl transition-shadow flex flex-col justify-between">
    <div>
      <Link href={`/product/${product.slug}`} className="group">
        {product.thumbnail && (
          <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-200 xl:aspect-w-7 xl:aspect-h-8">
            <img
              src={product.thumbnail}
              alt={product.title}
              className="h-full w-full object-cover object-center group-hover:opacity-75"
            />
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

// Skeleton component for ProductCard is now imported

interface CategoryFilterableProductsProps {
  initialProducts: Product[]; // Should now be ALL products for the category for client-side filtering
  totalInitialProducts: number; // Total for the category
  availableBrands: string[];
  categorySlug: string;
  initialHumanReadableCategoryName: string;
}

function CategoryFilterableProductsClient({
  initialProducts, // These are ALL products for the category
  totalInitialProducts,
  availableBrands,
  categorySlug,
  initialHumanReadableCategoryName,
}: CategoryFilterableProductsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [displayedProducts, setDisplayedProducts] = useState<Product[]>(initialProducts);
  // totalProductsFromServer will store the 'total' count from the API response
  const [totalProductsFromServer, setTotalProductsFromServer] = useState<number>(totalInitialProducts);

  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // State for price inputs (controlled components)
  const [minPriceInput, setMinPriceInput] = useState<string>('');
  const [maxPriceInput, setMaxPriceInput] = useState<string>('');

  // State for applied price filters (parsed and validated)
  const [appliedMinPrice, setAppliedMinPrice] = useState<number | undefined>(undefined);
  const [appliedMaxPrice, setAppliedMaxPrice] = useState<number | undefined>(undefined);
  const [priceValidationError, setPriceValidationError] = useState<string | null>(null);
  const [appliedSort, setAppliedSort] = useState<SortOption>('relevance'); // Added sort state

  // Configuration for sort dropdown
  const sortOptionsConfiguration: { value: SortOption; label: string }[] = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'newest', label: 'Newest Arrivals' },
  ];

  // Effect to initialize filters from URL on mount and when searchParams change
  useEffect(() => {
    const brandsFromUrl = searchParams.getAll('brand');
    const validBrandsFromUrl = brandsFromUrl.filter(brand => availableBrands.includes(brand));
    setSelectedBrands(validBrandsFromUrl);

    const minPriceFromUrl = searchParams.get('minPrice');
    const maxPriceFromUrl = searchParams.get('maxPrice');
    const sortFromUrl = searchParams.get('sort') as SortOption | null;

    const parsedMin = minPriceFromUrl ? parseFloat(minPriceFromUrl) : undefined;
    const parsedMax = maxPriceFromUrl ? parseFloat(maxPriceFromUrl) : undefined;

    const finalMinPrice = isNaN(parsedMin!) ? undefined : parsedMin;
    const finalMaxPrice = isNaN(parsedMax!) ? undefined : parsedMax;

    setAppliedMinPrice(finalMinPrice);
    setAppliedMaxPrice(finalMaxPrice);
    setMinPriceInput(minPriceFromUrl || '');
    setMaxPriceInput(maxPriceFromUrl || '');

    const validSortFromUrl = sortFromUrl && AllSortOptions.includes(sortFromUrl) ? sortFromUrl : 'relevance';
    setAppliedSort(validSortFromUrl);

    // Initial product display logic based on URL params or initial props
    if (validBrandsFromUrl.length === 0 && finalMinPrice === undefined && finalMaxPrice === undefined && validSortFromUrl === 'relevance') {
        setDisplayedProducts(initialProducts);
        setTotalProductsFromServer(totalInitialProducts);
    }
    // Else, the fetching effect will be triggered by changes to applied filters including appliedSort.

    setIsMounted(true);
  }, [searchParams, availableBrands, initialProducts, totalInitialProducts]);

  // Memoized function for fetching products
  const fetchProductsFromApi = useCallback(async () => {
    if (!isMounted) return;

    setIsLoading(true);
    try {
      const limit = 12;
      const result = await getProducts({
        category: categorySlug,
        brands: selectedBrands.length > 0 ? selectedBrands : undefined,
        minPrice: appliedMinPrice,
        maxPrice: appliedMaxPrice,
        sort: appliedSort, // Pass sort option
        limit: limit,
        skip: 0,
      });
      setDisplayedProducts(result.items);
      setTotalProductsFromServer(result.total);
    } catch (error) {
      console.error('Failed to fetch products based on filters:', error);
      setDisplayedProducts([]);
      setTotalProductsFromServer(0);
    } finally {
      setIsLoading(false);
    }
  }, [isMounted, categorySlug, selectedBrands, appliedMinPrice, appliedMaxPrice, appliedSort, setIsLoading, setDisplayedProducts, setTotalProductsFromServer]);

  // Effect to fetch products when relevant filters change
  useEffect(() => {
    if (isMounted) {
      fetchProductsFromApi();
    }
  }, [isMounted, fetchProductsFromApi]);

  // Effect to update URL when filters change
  useEffect(() => {
    if (!isMounted) return;

    const newQueryString = buildProductFilterQueryString(
      {
        brands: selectedBrands,
        minPrice: appliedMinPrice,
        maxPrice: appliedMaxPrice,
        sort: appliedSort, // Add sort to URL builder
      },
      searchParams.toString()
    );

    if (searchParams.toString() !== newQueryString) {
      router.push(`${pathname}?${newQueryString}`, { scroll: false });
    }
  }, [isMounted, selectedBrands, appliedMinPrice, appliedMaxPrice, appliedSort, pathname, router, searchParams]);

  const handleBrandChange = (brand: string) => {
    setSelectedBrands(prev => {
      const newSelectedBrands = prev.includes(brand)
        ? prev.filter(b => b !== brand)
        : [...prev, brand];
      return newSelectedBrands;
    });
  };

  // Debounced effect for price inputs
  useEffect(() => {
    const handler = setTimeout(() => {
      const min = parseFloat(minPriceInput);
      const max = parseFloat(maxPriceInput);

      const newMinPrice = !isNaN(min) && min >= 0 ? min : undefined;
      const newMaxPrice = !isNaN(max) && max >= 0 ? max : undefined;

      if (newMinPrice !== undefined && newMaxPrice !== undefined && newMinPrice > newMaxPrice) {
        setPriceValidationError('Min price cannot exceed max price.');
        // Do not update appliedMinPrice or appliedMaxPrice if validation fails
      } else {
        setPriceValidationError(null); // Clear error
        setAppliedMinPrice(newMinPrice);
        setAppliedMaxPrice(newMaxPrice);
      }
    }, 500); // 500ms debounce delay

    return () => {
      clearTimeout(handler);
    };
  }, [minPriceInput, maxPriceInput]);

  let filterBadges: string[] = [];
  if (selectedBrands.length > 0) {
    filterBadges.push(`Brands: ${selectedBrands.join(', ')}`);
  }
  if (appliedMinPrice !== undefined) {
    filterBadges.push(`Min Price: $${appliedMinPrice}`);
  }
  if (appliedMaxPrice !== undefined) {
    filterBadges.push(`Max Price: $${appliedMaxPrice}`);
  }
  if (appliedSort && appliedSort !== 'relevance') {
    const sortOptionLabel = sortOptionsConfiguration.find(opt => opt.value === appliedSort)?.label || appliedSort;
    filterBadges.push(`Sort: ${sortOptionLabel}`);
  }


  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setAppliedSort(event.target.value as SortOption);
  };

  const handleClearFilters = () => {
    setSelectedBrands([]);
    setMinPriceInput('');
    setMaxPriceInput('');
    setAppliedMinPrice(undefined);
    setAppliedMaxPrice(undefined);
    setPriceValidationError(null);
    setAppliedSort('relevance');
    // The existing useEffect for URL updates will handle pushing to router
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-3xl font-bold">Category: {initialHumanReadableCategoryName}</h1>
        <div>
          <label htmlFor="sort-products" className="sr-only">Sort products by</label>
          <select
            id="sort-products"
            value={appliedSort}
            onChange={handleSortChange}
            className="border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            {sortOptionsConfiguration.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <p className="text-gray-600 mb-1">
        Showing {isLoading ? '...' : displayedProducts.length} of {totalProductsFromServer} products.
      </p>
      {filterBadges.length > 0 && (
        <p className="text-sm text-gray-500 mb-6">
          Active filters: {filterBadges.join('; ')}
        </p>
      )}
       {!filterBadges.length && <p className="text-sm text-gray-500 mb-6">No active filters.</p>}


      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-1/4 lg:w-1/5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Filters</h2>
            <button
              onClick={handleClearFilters}
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
            >
              Clear Filters
            </button>
          </div>

          <div className="mb-6">
            <h3 className="font-medium mb-2">Brand</h3>
            {availableBrands.map(brand => {
              const brandId = `brand-checkbox-${brand.toLowerCase().replace(/\s+/g, '-')}`;
              return (
                <label key={brand} htmlFor={brandId} className="flex items-center space-x-2 text-sm cursor-pointer hover:bg-gray-100 p-1 rounded">
                  <input
                    type="checkbox"
                    id={brandId}
                    className="form-checkbox rounded text-blue-600 focus:ring-blue-500"
                    value={brand}
                    checked={selectedBrands.includes(brand)}
                    onChange={() => handleBrandChange(brand)}
                  />
                  <span>{brand}</span>
                </label>
              );
            })}
            {availableBrands.length === 0 && <p className="text-sm text-gray-500">No brands to filter.</p>}
          </div>

          <div>
            <h3 className="font-medium mb-2">Price Range</h3>
            <div className="space-y-3">
              {priceValidationError && (
                <p className="text-sm text-red-600 bg-red-100 p-2 rounded">{priceValidationError}</p>
              )}
              <div>
                <label htmlFor="minPrice" className="block text-sm font-medium text-gray-700">Min Price</label>
                <input
                  type="number"
                  id="minPrice"
                  name="minPrice"
                  value={minPriceInput}
                  onChange={(e) => setMinPriceInput(e.target.value)}
                  placeholder="e.g., 10"
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    priceValidationError ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              <div>
                <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700">Max Price</label>
                <input
                  type="number"
                  id="maxPrice"
                  name="maxPrice"
                  value={maxPriceInput}
                  onChange={(e) => setMaxPriceInput(e.target.value)}
                  placeholder="e.g., 100"
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    priceValidationError ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {/* Apply button removed, debouncing handles updates */}
            </div>
          </div>
        </aside>

        <main className="w-full md:w-3/4 lg:w-4/5">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => ( // Display 6 skeletons
                <ProductCardSkeleton key={index} />
              ))}
            </div>
          ) : displayedProducts.length === 0 ? (
            <div className="text-center py-10">
              <h2 className="text-2xl font-semibold mb-2">No products found</h2>
              <p className="text-gray-600">Try adjusting your filters or check back later.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function CategoryFilterableProducts(props: CategoryFilterableProductsProps) {
  // Wrap the client component in Suspense to handle useSearchParams()
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8 text-center">Loading category products...</div>}>
      <CategoryFilterableProductsClient {...props} />
    </Suspense>
  );
}

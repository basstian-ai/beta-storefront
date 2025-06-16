'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { z } from 'zod';
import { ProductSchema } from '@/bff/types';
import { getProducts, ServiceProductsResponseSchema } from '@/bff/services';

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

  // Effect to initialize filters from URL on mount and when searchParams change
  useEffect(() => {
    const brandsFromUrl = searchParams.getAll('brand');
    const validBrandsFromUrl = brandsFromUrl.filter(brand => availableBrands.includes(brand));
    setSelectedBrands(validBrandsFromUrl);

    const minPriceFromUrl = searchParams.get('minPrice');
    const maxPriceFromUrl = searchParams.get('maxPrice');

    const parsedMin = minPriceFromUrl ? parseFloat(minPriceFromUrl) : undefined;
    const parsedMax = maxPriceFromUrl ? parseFloat(maxPriceFromUrl) : undefined;

    setAppliedMinPrice(isNaN(parsedMin!) ? undefined : parsedMin);
    setAppliedMaxPrice(isNaN(parsedMax!) ? undefined : parsedMax);

    setMinPriceInput(minPriceFromUrl || '');
    setMaxPriceInput(maxPriceFromUrl || '');

    setIsMounted(true);
  }, [searchParams, availableBrands]);

  // Effect to fetch products when filters change, only after mount
  useEffect(() => {
    if (!isMounted) {
      // Initial render with server-passed props if no client-side filters from URL are immediately applicable
      // This logic might need refinement if initialProducts should always be shown first regardless of URL params
      // For now, if URL has params, they will be applied by the first run of the above useEffect, then this one.
      if (selectedBrands.length === 0 && appliedMinPrice === undefined && appliedMaxPrice === undefined) {
          setDisplayedProducts(initialProducts);
          setTotalProductsFromServer(totalInitialProducts);
      }
      return;
    }

    const fetchProductsFromApi = async () => {
      setIsLoading(true);
      try {
        const limit = 12;
        const result = await getProducts({
          category: categorySlug,
          brands: selectedBrands.length > 0 ? selectedBrands : undefined,
          minPrice: appliedMinPrice,
          maxPrice: appliedMaxPrice,
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
    };

    fetchProductsFromApi();

    // Update URL based on selectedBrands and applied prices
    const params = new URLSearchParams(searchParams.toString());
    params.delete('brand');
    selectedBrands.forEach(brand => params.append('brand', brand));

    if (appliedMinPrice !== undefined) {
      params.set('minPrice', String(appliedMinPrice));
    } else {
      params.delete('minPrice');
    }
    if (appliedMaxPrice !== undefined) {
      params.set('maxPrice', String(appliedMaxPrice));
    } else {
      params.delete('maxPrice');
    }

    const queryString = params.toString();
    if (searchParams.toString() !== queryString) {
      router.push(`${pathname}?${queryString}`, { scroll: false });
    }
  }, [selectedBrands, appliedMinPrice, appliedMaxPrice, categorySlug, isMounted, pathname, router, searchParams, initialProducts, totalInitialProducts]);

  const handleBrandChange = (brand: string) => {
    setSelectedBrands(prev => {
      const newSelectedBrands = prev.includes(brand)
        ? prev.filter(b => b !== brand)
        : [...prev, brand];
      return newSelectedBrands;
    });
  };

  const handleApplyPriceFilter = () => {
    const min = parseFloat(minPriceInput);
    const max = parseFloat(maxPriceInput);

    const newMinPrice = !isNaN(min) && min >= 0 ? min : undefined;
    const newMaxPrice = !isNaN(max) && max >= 0 ? max : undefined;

    // Basic validation: if min > max, maybe reset max or show error. For now, allow.
    // User can also clear inputs, which should result in undefined.
    setAppliedMinPrice(newMinPrice);
    setAppliedMaxPrice(newMaxPrice);
    // The useEffect for fetching will pick up these changes and also update URL
  };

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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Category: {initialHumanReadableCategoryName}</h1>
      <p className="text-gray-600 mb-1">
        Showing {isLoading ? '...' : displayedProducts.length} of {totalProductsFromServer} products.
      </p>
      {filterBadges.length > 0 && (
        <p className="text-sm text-gray-500 mb-6">
          Filtered by: {filterBadges.join('; ')}
        </p>
      )}
       {!filterBadges.length && <p className="text-sm text-gray-500 mb-6">No active filters.</p>}


      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-1/4 lg:w-1/5">
          <h2 className="text-xl font-semibold mb-4">Filters</h2>

          <div className="mb-6"> {/* Increased mb for spacing */}
            <h3 className="font-medium mb-2">Brand</h3>
            {availableBrands.map(brand => (
              <label key={brand} className="flex items-center space-x-2 text-sm cursor-pointer hover:bg-gray-100 p-1 rounded">
                <input
                  type="checkbox"
                  className="form-checkbox rounded text-blue-600 focus:ring-blue-500"
                  value={brand}
                  checked={selectedBrands.includes(brand)}
                  onChange={() => handleBrandChange(brand)}
                />
                <span>{brand}</span>
              </label>
            ))}
            {availableBrands.length === 0 && <p className="text-sm text-gray-500">No brands to filter.</p>}
          </div>

          <div>
            <h3 className="font-medium mb-2">Price Range</h3>
            <div className="space-y-3">
              <div>
                <label htmlFor="minPrice" className="block text-sm font-medium text-gray-700">Min Price</label>
                <input
                  type="number"
                  id="minPrice"
                  name="minPrice"
                  value={minPriceInput}
                  onChange={(e) => setMinPriceInput(e.target.value)}
                  placeholder="e.g., 10"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <button
                onClick={handleApplyPriceFilter}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-md text-sm"
              >
                Apply Price Filter
              </button>
            </div>
          </div>
        </aside>

        <main className="w-full md:w-3/4 lg:w-4/5">
          {isLoading && <p className="text-center py-10">Loading products...</p>}
          {!isLoading && displayedProducts.length === 0 && (
            <p className="text-center py-10">No products match the selected filters.</p>
          )}
          {!isLoading && displayedProducts.length > 0 && (
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

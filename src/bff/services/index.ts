// src/bff/services/index.ts
import * as dummyJsonAdapter from '../adapters/dummyjson';
import {
  ProductSchema,
  CategorySchema,
  // UserSchema, // Removed as unused
  // AuthResponseSchema, // No longer used for login from services, schema is in adapter
  PriceSchema,
  PaginatedProductsSchema,
  ServiceProductsResponseSchema,
  GetProductsOptions, // Import the new options type
} from '../types';
import { z } from 'zod';
import { slugify } from '@/lib/utils'; // Import slugify

// Helper to simulate session for B2B pricing
// In-memory cache for products and slug-to-id mapping
let allProductsCache: z.infer<typeof ProductSchema>[] | null = null;
const slugToIdMap = new Map<string, number>();
let productsPromise: Promise<void> | null = null;

async function initializeProductsCache(): Promise<void> {
  // Prevent re-entrancy or multiple initializations
  if (productsPromise && !allProductsCache) {
     await productsPromise; // If a promise is already in flight but cache not set, wait for it
     if(allProductsCache) return; // If cache got set by the awaited promise, return
  }
  if (allProductsCache) return; // If cache is already populated, do nothing

  if (process.env.NODE_ENV !== 'production') {
    console.log('BFF> Initializing products cache for slug lookup...');
  }
  const rawData = await dummyJsonAdapter.fetchAllProductsSimple();
  const parsedData = PaginatedProductsSchema.parse(rawData);

  allProductsCache = parsedData.products.map(p => {
    const productSlug = slugify(p.title);
    const productWithSlug = { ...p, slug: productSlug };
    // At this stage, p might not have effectivePrice, so ensure ProductSchema validation is appropriate
    // Or, ensure applyB2BPrice is called if needed before this specific parse
    // For now, assuming ProductSchema can parse it before B2B logic if effectivePrice is optional
    return ProductSchema.parse(productWithSlug);
  });

  slugToIdMap.clear();
  allProductsCache.forEach(p => {
    if (p.slug) slugToIdMap.set(p.slug, p.id);
  });
  if (process.env.NODE_ENV !== 'production') {
    console.log(`BFF> Products cache initialized. ${allProductsCache.length} products, ${slugToIdMap.size} slugs mapped.`);
  }
}

// Helper to ensure cache is ready
async function ensureCacheReady() {
  if (!productsPromise) {
    productsPromise = initializeProductsCache().catch(err => {
      if (process.env.NODE_ENV !== 'production') {
        console.error("BFF> Failed to initialize products cache:", err);
      }
      productsPromise = null; // Reset promise on failure to allow retry
      allProductsCache = null; // Ensure cache is null on failure
      throw err; // Re-throw to indicate failure to the caller
    });
  }
  await productsPromise;
}


async function getSimulatedSession(): Promise<{ user?: { role?: string } } | null> {
  return null;
}

function applyB2BPrice(productData: z.infer<typeof ProductSchema>, session: { user?: { role?: string } } | null): z.infer<typeof ProductSchema> {
  let effectivePriceAmount = productData.price; // Default to original price

  // Apply B2B discount if applicable
  if (session?.user?.role === 'b2b') {
    effectivePriceAmount = parseFloat((productData.price * 0.9).toFixed(2));
  }

  // Construct effectivePrice object, ensuring it matches PriceSchema
  const effectivePriceObject = PriceSchema.parse({
    amount: effectivePriceAmount,
    // currencyCode will use default 'USD' from PriceSchema if not specified here
    // If productData has a specific currencyCode for its original price, you might want to carry it over
    // For now, we rely on PriceSchema's default or whatever might be in productData.effectivePrice already
    currencyCode: productData.effectivePrice?.currencyCode || 'USD',
    discountPercentage: productData.discountPercentage, // Keep original discount for display if B2B price isn't applied
  });

  // If B2B price is applied, original discountPercentage might not be relevant in the same way.
  // Clear it if B2B price is active, or adjust logic as needed.
  if (session?.user?.role === 'b2b' && effectivePriceAmount < productData.price) {
     // productData.discountPercentage = undefined; // Or handle differently
  }


  return {
    ...productData,
    effectivePrice: effectivePriceObject,
  };
}

export async function getProducts(
  options: GetProductsOptions = {}
): Promise<z.infer<typeof ServiceProductsResponseSchema>> {
  if (process.env.NODE_ENV !== 'production') {
    console.log('BFF> getProducts service called with options:', options );
  }
  // Pass all options, including `brands`, to the adapter.
  // The adapter will handle the DummyJSON specifics (e.g., client-side filtering for brands if API doesn't support it).
  const rawData = await dummyJsonAdapter.fetchProducts(options);

  // The adapter now returns data where product.category is already an object.
  // So, PaginatedProductsSchema should correctly parse this.
  const parsedData = PaginatedProductsSchema.parse(rawData);
  const session = await getSimulatedSession();

  const productsWithSlugsAndB2BPricing = parsedData.products.map(p => {
    const productSlug = slugify(p.title);
    // Important: Validate the product with the slug *before* applying B2B price
    // This ensures the slug is part of the object passed to applyB2BPrice
    const productWithSlug = ProductSchema.parse({ ...p, slug: productSlug });
    return applyB2BPrice(productWithSlug, session);
  });

  return ServiceProductsResponseSchema.parse({
    items: productsWithSlugsAndB2BPricing,
    total: parsedData.total,
    skip: parsedData.skip,
    limit: parsedData.limit,
  });
}

export const DEFAULT_LIMIT = 20;

export async function searchProducts(
  query: string,
  sort: 'relevance' | 'price-asc' | 'price-desc' = 'relevance',
  skip = 0,
  limit = DEFAULT_LIMIT
): Promise<z.infer<typeof ServiceProductsResponseSchema>> {
    if (process.env.NODE_ENV !== 'production') {
      console.log('BFF> searchProducts (slug enhancement pass)', { query, sort, skip, limit });
    }
    const rawData = await dummyJsonAdapter.searchProducts(query, sort, skip, limit);
    const parsedData = PaginatedProductsSchema.parse(rawData);
    const session = await getSimulatedSession();

    const productsWithSlugsAndB2BPricing = parsedData.products.map(p => {
        const productSlug = slugify(p.title);
        const productWithSlug = ProductSchema.parse({ ...p, slug: productSlug });
        return applyB2BPrice(productWithSlug, session);
    });

    return ServiceProductsResponseSchema.parse({
        items: productsWithSlugsAndB2BPricing,
        total: parsedData.total,
        skip: parsedData.skip,
        limit: parsedData.limit,
    });
}

export async function getProductByIdOrSlug(idOrSlug: number | string): Promise<z.infer<typeof ProductSchema>> {
  await ensureCacheReady();

  let productId: number | undefined;
  if (typeof idOrSlug === 'string' && isNaN(Number(idOrSlug))) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('BFF> getProductByIdOrSlug by SLUG', { slug: idOrSlug });
    }
    productId = slugToIdMap.get(idOrSlug);
    if (productId === undefined && allProductsCache) { // Check cache if map misses
      const productFromCache = allProductsCache.find(p => p.slug === idOrSlug);
      if (productFromCache) productId = productFromCache.id;
    }
    if (productId === undefined) {
        throw new Error(`Product with slug "${idOrSlug}" not found.`);
    }
  } else {
    productId = Number(idOrSlug);
    if (process.env.NODE_ENV !== 'production') {
      console.log('BFF> getProductByIdOrSlug by ID', { id: productId });
    }
  }

  const rawData = await dummyJsonAdapter.fetchProductById(productId);
  if (!rawData) {
    throw new Error(`Product with id ${productId} not found.`);
  }
  // Parse raw product data first (it won't have a slug from the API)
  // Ensure ProductSchema used here doesn't strictly require slug, or omit slug for this parse
  const tempProductSchema = ProductSchema.omit({ slug: true, effectivePrice: true }); // effectivePrice is also added by our logic
  const productData = tempProductSchema.parse(rawData);

  const productSlug = slugify(productData.title);
  // Construct the full product object including the slug, then parse with the full ProductSchema
  const productWithSlug = ProductSchema.parse({ ...productData, slug: productSlug });

  const session = await getSimulatedSession();
  return applyB2BPrice(productWithSlug, session);
}

export async function login(credentials: { username?: string; password?: string }): Promise<z.infer<typeof dummyJsonAdapter.AdapterLoginResponseSchema>> {
  if (process.env.NODE_ENV !== 'production') {
    console.log('BFF> login service: Called with username:', credentials.username);
  }
  // The adapter's login function now handles fetching, parsing with ApiLoginResponseSchema,
  // and then transforming and validating against AdapterLoginResponseSchema.
  // So, the data returned here is already validated and shaped correctly (with accessToken).
  const adapterResponse = await dummyJsonAdapter.login(credentials);
  if (process.env.NODE_ENV !== 'production') {
    console.log('BFF> login service: Response from adapter:', adapterResponse);
  }
  return adapterResponse;
}

export async function getCategories(fetchOptions?: RequestInit): Promise<z.infer<typeof CategorySchema>[]> { // Added fetchOptions
  if (process.env.NODE_ENV !== 'production') {
    console.log('BFF> getCategories service: Called with fetchOptions:', { fetchOptions });
  }
  try {
    const rawDataFromAdapter = await dummyJsonAdapter.fetchCategories(fetchOptions); // Pass options
    if (process.env.NODE_ENV !== 'production') {
      console.log('[Service.getCategories] Data received from adapter:', JSON.stringify(rawDataFromAdapter));
    }

    // Zod parsing will validate if rawDataFromAdapter matches Array<CategorySchema_compatible_objects>
    const categories = z.array(CategorySchema).parse(rawDataFromAdapter);
    if (process.env.NODE_ENV !== 'production') {
      console.log('[Service.getCategories] Parsed categories (final result):', JSON.stringify(categories));
    }
    return categories;
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      if (error instanceof z.ZodError) {
        console.error('[Service.getCategories] Zod validation error:', JSON.stringify(error.errors));
      } else if (error instanceof Error) {
        console.error('[Service.getCategories] Error fetching or processing categories:', error.message, error.stack);
      } else {
        console.error('[Service.getCategories] Unknown error fetching or processing categories:', error);
      }
    }
    // Re-throw the error or return empty array / handle as per service contract
    // For now, let's re-throw so RootLayout's catch block handles it for UI error message.
    throw error;
  }
}

// Example usage check (not for runtime, just for type checking during dev)
// Updated to reflect new function name and potential slug usage
/*
async function check() {
  const { items } = await getProducts({ limit: 3 });
  if (items[0]) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(items[0].title, items[0].slug);
      console.log(items[0].effectivePrice?.amount);
    }
  }
  if (items[0] && items[0].slug) {
    const product = await getProductByIdOrSlug(items[0].slug);
    if (process.env.NODE_ENV !== 'production') {
      console.log("Fetched by slug:", product.title);
    }
  }
}
*/

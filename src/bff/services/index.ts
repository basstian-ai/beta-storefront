// src/bff/services/index.ts
import * as dummyJsonAdapter from '../adapters/dummyjson';
import {
  ProductSchema,
  CategorySchema,
  UserSchema,
  AuthResponseSchema,
  PriceSchema,
  PaginatedProductsSchema,
  ServiceProductsResponseSchema,
} from '../types';
import { z } from 'zod';

// Helper to simulate session for B2B pricing
// In a real app, this would come from NextAuth.js `getServerSession`
async function getSimulatedSession(): Promise<{ user?: { role?: string } } | null> {
  // For now, let's assume we can toggle this for testing B2B prices.
  // Later, NextAuth will provide the actual session.
  // To test B2B, you could temporarily set this to:
  // return { user: { role: 'b2b' } };
  return null; // Default to no session or non-B2B user
}

function applyB2BPrice(productData: z.infer<typeof ProductSchema>, session: { user?: { role?: string } } | null): z.infer<typeof ProductSchema> {
  let effectivePrice = productData.price;
  if (session?.user?.role === 'b2b') {
    effectivePrice = parseFloat((productData.price * 0.9).toFixed(2));
  }
  return {
    ...productData,
    effectivePrice: PriceSchema.parse({
      amount: effectivePrice,
      // currencyCode will use default 'USD' from schema if not provided
      discountPercentage: productData.discountPercentage, // keep original discount for display
    }),
  };
}

export async function getProducts(options: {
  category?: string;
  limit?: number;
  skip?: number;
  sort?: string; // Example: 'title.asc' or 'price.desc'
} = {}): Promise<z.infer<typeof ServiceProductsResponseSchema>> {
  console.log('BFF> getProducts', { options });
  const rawData = await dummyJsonAdapter.fetchProducts(options);
  const parsedData = PaginatedProductsSchema.parse(rawData);
  const session = await getSimulatedSession();

  const productsWithB2BPricing = parsedData.products.map(p => applyB2BPrice(p, session));

  return ServiceProductsResponseSchema.parse({
    items: productsWithB2BPricing,
    total: parsedData.total,
    skip: parsedData.skip,
    limit: parsedData.limit,
  });
}

export async function getProductById(id: number | string): Promise<z.infer<typeof ProductSchema>> {
  console.log('BFF> getProductById', { id });
  const rawData = await dummyJsonAdapter.fetchProductById(id);
  const product = ProductSchema.parse(rawData);
  const session = await getSimulatedSession();
  return applyB2BPrice(product, session);
}

export async function searchProducts(query: string): Promise<z.infer<typeof ServiceProductsResponseSchema>> {
  console.log('BFF> searchProducts', { query });
  const rawData = await dummyJsonAdapter.searchProducts(query);
  const parsedData = PaginatedProductsSchema.parse(rawData); // Assuming search returns same paginated structure
  const session = await getSimulatedSession();

  const productsWithB2BPricing = parsedData.products.map(p => applyB2BPrice(p, session));

  return ServiceProductsResponseSchema.parse({
    items: productsWithB2BPricing,
    total: parsedData.total,
    skip: parsedData.skip,
    limit: parsedData.limit,
  });
}

export async function login(credentials: { username?: string; password?: string }): Promise<z.infer<typeof AuthResponseSchema>> {
  console.log('BFF> login', { username: credentials.username });
  const rawData = await dummyJsonAdapter.login(credentials);
  // The AuthResponseSchema expects a token, which dummyjson provides directly.
  // The UserSchema part of AuthResponse will be mapped.
  // Note: dummyjson /auth/login returns user details *and* token at the root level.
  // AuthResponseSchema is designed to capture this.
  const validatedResponse = AuthResponseSchema.parse(rawData);
  return validatedResponse;
}

export async function getCategories(): Promise<z.infer<typeof CategorySchema>[]> {
  console.log('BFF> getCategories', {});
  const rawData = await dummyJsonAdapter.fetchCategories();
  // dummyjson returns an array of strings for categories
  const categories = z.array(CategorySchema).parse(rawData);
  return categories;
}

// Example usage check (not for runtime, just for type checking during dev)
async function check() {
  const { items } = await getProducts({ limit: 3 });
  if (items[0]) {
    console.log(items[0].title); // Should have 'title'
    console.log(items[0].effectivePrice?.amount); // Should have 'effectivePrice'
  }
}

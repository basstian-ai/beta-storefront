// src/bff/types.ts
import { z } from 'zod';

// Corresponds to the structure of individual price data, if applicable
// Based on dummyjson, products have 'price', 'discountPercentage'
export const PriceSchema = z.object({
  amount: z.number(),
  currencyCode: z.string().optional().default('USD'), // Changed this line
  discountPercentage: z.number().optional(),
});

export const ProductSchema = z.object({
  id: z.number(),
  title: z.string(),
  slug: z.string().optional(), // Add slug, make it optional for now
  description: z.string(),
  price: z.number(), // This is the original price from dummyjson
  discountPercentage: z.number().optional(),
  rating: z.number().optional(),
  stock: z.number().optional(),
  brand: z.string().optional(),
  category: z.lazy(() => CategorySchema), // Using z.lazy()
  thumbnail: z.string().url().optional(),
  images: z.array(z.string().url()).optional(),
  // This will be populated by our service layer
  effectivePrice: PriceSchema.optional(),
});

export const CategorySchema = z.object({
  id: z.number().optional(), // Or z.string() if IDs are not numbers
  name: z.string(), // This will be the display-friendly name
  slug: z.string()  // This will be the URL-friendly slug (original string from dummyjson)
});

export const UserSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  gender: z.string().optional(),
  image: z.string().url().optional(),
  role: z.string().optional(), // To store 'b2b' or other roles
  // dummyjson token is just a string, not part of user object from /auth/login
});

export const AuthResponseSchema = z.object({
  id:           z.string(), // Changed from z.number() to z.string()
  username:     z.string(),
  email:        z.string().email(),
  firstName:    z.string(), // Kept, as adapter passes it through
  lastName:     z.string(), // Kept, as adapter passes it through
  gender:       z.string(),
  image:        z.string().url(),
  token:        z.string(),      // Now correctly expects 'token' (which was accessToken)
  refreshToken: z.string(),      // Added refreshToken
  name:         z.string(),      // Added combined name
  expiresInMins:z.number().optional(), // Added for token expiry calculation
  // role is not part of dummyjson /auth/login response, will be handled by session.
  // Optional fields from original schema are now required as adapter provides them.
});
export type AuthResponse = z.infer<typeof AuthResponseSchema>; // Added this line

// Schema for the raw successful login response from DummyJSON API
export const zDummyJsonLoginSuccess = z.object({
  id:           z.number(),
  username:     z.string(),
  email:        z.string().email(),
  firstName:    z.string(),
  lastName:     z.string(),
  gender:       z.string(),
  image:        z.string().url(),
  accessToken:  z.string(),
  refreshToken: z.string(),
});
export type DummyJsonLoginSuccess = z.infer<typeof zDummyJsonLoginSuccess>;

// Schema for the raw successful token refresh response from DummyJSON API
// It's often similar to the login success response.
export const zDummyJsonRefreshResponse = zDummyJsonLoginSuccess.extend({});
export type DummyJsonRefreshResponse = z.infer<typeof zDummyJsonRefreshResponse>;

// Type for getProducts response
export const PaginatedProductsSchema = z.object({
  products: z.array(ProductSchema),
  total: z.number(),
  skip: z.number(),
  limit: z.number(),
});

// Define available sort options
export type SortOption = 'relevance' | 'price_asc' | 'price_desc' | 'newest';
export const AllSortOptions: SortOption[] = ['relevance', 'price_asc', 'price_desc', 'newest']; // For validation if needed

// Options for getProducts service function
export interface GetProductsOptions {
  category?: string;
  limit?: number;
  skip?: number;
  sort?: SortOption; // Changed from string to SortOption
  brands?: string[]; // For filtering by one or more brands
  minPrice?: number;
  maxPrice?: number;
}

// For services layer to return a consistent structure
export const ServiceProductsResponseSchema = z.object({
  items: z.array(ProductSchema),
  total: z.number(),
  skip: z.number(),
  limit: z.number(),
});

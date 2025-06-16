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
  category: z.string(),
  thumbnail: z.string().url().optional(),
  images: z.array(z.string().url()).optional(),
  // This will be populated by our service layer
  effectivePrice: PriceSchema.optional(),
});

export const CategorySchema = z.object({
  id: z.number(), // Or z.string() if IDs are not numbers
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
  id: z.number(),
  username: z.string(),
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  gender: z.string().optional(),
  image: z.string().url().optional(),
  token: z.string(),
  // role is not part of dummyjson /auth/login response, will be handled by session
});

// Type for getProducts response
export const PaginatedProductsSchema = z.object({
  products: z.array(ProductSchema),
  total: z.number(),
  skip: z.number(),
  limit: z.number(),
});

// For services layer to return a consistent structure
export const ServiceProductsResponseSchema = z.object({
  items: z.array(ProductSchema),
  total: z.number(),
  skip: z.number(),
  limit: z.number(),
});

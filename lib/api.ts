import type { Category, HeroContent } from '../types'; // Adjust path if necessary

export async function fetchCategories(): Promise<Category[]> {
  // TODO: Replace with actual BFF endpoint later
  const res = await fetch('https://dummyjson.com/products/categories');
  if (!res.ok) {
    // Log the error for server-side visibility
    console.error('Failed to fetch categories:', res.status, await res.text());
    throw new Error('Failed to fetch categories');
  }
  const data = await res.json();

  // Ensure data is an array before mapping
  if (Array.isArray(data)) {
    return data.map((categoryName: any) => {
      // Assuming categoryName is a string, adjust if the API returns objects
      if (typeof categoryName === 'string') {
        return {
          id: categoryName, // Or generate a unique ID if needed
          name: categoryName,
          slug: categoryName.toLowerCase().replace(/\s+/g, '-'), // Create a simple slug
        };
      } else if (typeof categoryName === 'object' && categoryName !== null && categoryName.name && categoryName.slug) {
        // If the API returns objects with name and slug properties
        return {
          id: categoryName.slug, // Or categoryName.id if available
          name: categoryName.name,
          slug: categoryName.slug,
        };
      } else {
        // Log unexpected format and skip
        console.warn('Unexpected category format:', categoryName);
        return null;
      }
    }).filter(Boolean) as Category[]; // Filter out nulls and assert type
  } else {
    console.error('Fetched data is not an array:', data);
    return [];
  }
}

export async function fetchFeaturedProducts(): Promise<Product[]> {
  const CMS_BASE_URL = process.env.NEXT_PUBLIC_CMS_BASE_URL || 'https://dummyjson.com';
  const res = await fetch(`${CMS_BASE_URL}/products?limit=6`); // DummyCMS format
  if (!res.ok) throw new Error('Failed to fetch featured products');

  const json = await res.json();
  return (json.products || []).map((p: any) => ({
    id: p.id.toString(), // Ensure id is string
    name: p.title,
    slug: p.id.toString(), // Use id as slug for simplicity with dummyjson
    price: p.price,
    imageUrl: p.thumbnail,
  }));
}

// Placeholder for CMS_BASE_URL, should be set in environment variables
const CMS_BASE_URL = process.env.NEXT_PUBLIC_CMS_BASE_URL || 'https://dummyjson.com'; // Using NEXT_PUBLIC_ prefix for client-side access if needed, or just process.env for server-side. For getStaticProps, process.env is fine.

export async function fetchHeroBanner(): Promise<HeroContent> {
  // Simulate fetching hero banner data from a CMS
  const response = await fetch(`${CMS_BASE_URL}/products/1`); // Using a product endpoint for dummy data

  if (!response.ok) {
    // Log the error for server-side debugging
    console.error('Failed to fetch hero banner data:', response.status, response.statusText);
    // Throw an error that can be caught by getStaticProps
    throw new Error('Failed to fetch hero banner content. Please check server logs for details.');
  }

  const product = await response.json();

  // Adapt the product data to HeroContent
  const heroData: HeroContent = { // Explicitly type the return
    title: product.title || 'Amazing Product!',
    description: product.description || 'Check out this incredible offer.',
    ctaText: 'Learn More',
    ctaLink: `/products/${product.id}`, // Example CTA link
    imageUrl: product.thumbnail || 'https://via.placeholder.com/600x400.png?text=Hero+Image', // Fallback placeholder
    imageAlt: product.title ? `Image for ${product.title}` : undefined // Ensure it aligns with optional imageAlt
  };
  return heroData;
}

// Add other existing API functions if any, or keep the file clean if it's new.
// For example, if there was an existing function like:
// export async function fetchProducts() { ... }
// It should be preserved.

// To ensure the file can be read and check its current content (if any):
// console.log("Current content of lib/api.ts will be preserved and fetchHeroBanner added/updated.");

export async function fetchFeaturedCategories(): Promise<Category[]> {
  const CMS_BASE_URL = process.env.NEXT_PUBLIC_CMS_BASE_URL || 'https://dummyjson.com';

  // The issue mentions /categories or /featured-categories.
  // Checking common patterns for dummyjson, products are under /products, users under /users.
  // It's likely categories are under /products/categories or just /products/category/some-category-name
  // or /categories if it's a dedicated endpoint.
  // dummyjson.com provides a /products/categories endpoint which returns a list of category names (strings).
  // And a /products/category/{slug} which returns products for a category.
  // For the purpose of this task, we need a list of category *objects*.
  // Let's try /products/categories first and see the structure. If it's just strings, we'll need to adapt.
  // The issue implies the endpoint returns objects with id, name, slug, image.
  // dummyjson.com /products returns products which have a category field (string).
  // It seems dummyjson.com doesn't have a direct equivalent of a "featured categories" endpoint that provides image URLs for categories.
  // Let's use /products as a source and derive categories from them, simulating a richer category object.
  // This is a common workaround when a direct endpoint isn't available.

  const response = await fetch(`${CMS_BASE_URL}/products?limit=5`); // Fetch a few products to get diverse categories
  if (!response.ok) throw new Error('Failed to fetch products for categories');

  const data = await response.json();

  // Assuming data.products is an array of product objects
  if (!data.products || !Array.isArray(data.products)) {
    console.error('Unexpected data structure from /products endpoint:', data);
    throw new Error('Failed to parse products for categories');
  }

  // Extract unique categories from the products
  const categoriesMap = new Map<string, Category>();
  data.products.forEach((product: any) => {
    if (product.category) {
      const slug = product.category.toLowerCase().replace(/\s+/g, '-');
      if (!categoriesMap.has(slug)) {
        categoriesMap.set(slug, {
          id: slug, // Use slug as ID if no specific ID is provided
          name: product.category,
          slug: slug,
          // dummyjson products have a 'thumbnail' and 'images' array. Let's use thumbnail for category image.
          imageUrl: product.thumbnail || `https://via.placeholder.com/150?text=${encodeURIComponent(product.category)}`,
        });
      }
    }
  });

  const uniqueCategories = Array.from(categoriesMap.values());

  // If the CMS_BASE_URL is dummyjson, it has a /products/categories endpoint which returns string array.
  // Let's refine this: if the direct /categories endpoint exists and returns the expected structure, use that.
  // The original plan was: const response = await fetch(`${CMS_BASE_URL}/categories`);
  // Let's assume for now that a /categories endpoint exists and returns something like:
  // [{ "id": "1", "name": "Electronics", "slug": "electronics", "image": "url..." }]
  // If not, the product derivation logic above is a fallback.
  // The issue statement's `fetchFeaturedCategories` uses `/categories`. We should stick to that first.

  const categoriesResponse = await fetch(`${CMS_BASE_URL}/categories`);
  if (!categoriesResponse.ok) {
    // Fallback to deriving from products if /categories fails or isn't as expected
    console.warn('Failed to fetch from /categories, attempting to derive from /products');
    return uniqueCategories.length > 0 ? uniqueCategories : []; // Return derived if available, else empty
  }

  const cmsCategoriesData = await categoriesResponse.json();

  // Check if cmsCategoriesData is an array and has the expected structure
  // dummyjson.com/categories returns ["smartphones","laptops","fragrances","skincare","groceries","home-decoration"]
  // This is an array of strings, not objects.
  // So we must map these strings to the Category type.
  if (Array.isArray(cmsCategoriesData) && cmsCategoriesData.every(item => typeof item === 'string')) {
    return cmsCategoriesData.map((categoryName: string, index: number) => {
      const slug = categoryName.toLowerCase().replace(/\s+/g, '-');
      return {
        id: `${index + 1}`, // Assign a simple ID
        name: categoryName,
        slug: slug,
        imageUrl: `https://via.placeholder.com/150?text=${encodeURIComponent(categoryName)}`, // Placeholder image
      };
    });
  } else if (Array.isArray(cmsCategoriesData) && cmsCategoriesData.length > 0 && typeof cmsCategoriesData[0] === 'object' && 'name' in cmsCategoriesData[0]) {
    // This branch assumes the /categories endpoint returns objects like [{id, name, slug, image}]
    return cmsCategoriesData.map((cat: any) => ({
      id: cat.id || cat.slug || cat.name.toLowerCase().replace(/\s+/g, '-'), // Prioritize given ID, then slug, then generate from name
      name: cat.name,
      slug: cat.slug || cat.name.toLowerCase().replace(/\s+/g, '-'),
      imageUrl: cat.image || cat.imageUrl || `https://via.placeholder.com/150?text=${encodeURIComponent(cat.name)}`,
    }));
  } else {
    // If the structure is unexpected, fall back to deriving from products or return empty
    console.warn('Unexpected data structure from /categories. Falling back to product-derived categories or empty array.');
    return uniqueCategories.length > 0 ? uniqueCategories : [];
  }
}

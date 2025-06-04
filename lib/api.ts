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

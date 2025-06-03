import { Category } from '../types';

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

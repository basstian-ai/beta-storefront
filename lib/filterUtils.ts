// lib/filterUtils.ts
import { Product } from './api'; // Assuming Product type is from lib/api.ts
import { ActiveFilters } from '@/components/FacetFilters'; // Assuming ActiveFilters type

export const filterProducts = (
  products: Product[],
  activeFilters: ActiveFilters
): Product[] => {
  if (!products) return [];
  if (Object.keys(activeFilters).length === 0) {
    return products; // No filters applied, return all products
  }

  return products.filter(product => {
    // Iterate over each active filter category (e.g., brand, size)
    for (const key in activeFilters) {
      const filterKey = key as keyof ActiveFilters; // Type assertion
      const selectedValues = activeFilters[filterKey];

      // If this filter category has no selected values, skip it
      if (!selectedValues || selectedValues.length === 0) {
        continue;
      }

      // Check if the product has this property and if its value matches any of the selected values
      // This assumes product properties match filter keys directly (e.g., product.brand, product.size)
      // For a more robust solution, you might need a mapping if keys differ.
      if (!product.hasOwnProperty(filterKey)) {
         // If the product doesn't have the property being filtered on (e.g. product has no 'brand' field)
         // and we have active filters for 'brand', then this product should not match.
        return false;
      }

      const productValue = product[filterKey as keyof Product] as string | string[];

      // Handle cases where productValue could be an array (e.g. product tags) or a single string
      if (Array.isArray(productValue)) {
        // If product value is an array, check for intersection
        if (!selectedValues.some(selectedValue => productValue.includes(selectedValue))) {
          return false; // Product does not have any of the selected values for this filter (AND logic across groups)
        }
      } else {
        // If product value is a string
        if (!selectedValues.includes(productValue)) {
          return false; // Product value does not match any selected values for this filter (AND logic across groups)
        }
      }
    }
    // If the product passed all active filter categories
    return true;
  });
};

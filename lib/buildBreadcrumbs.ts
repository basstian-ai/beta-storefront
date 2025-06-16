interface BreadcrumbSegment {
  label: string;
  href: string;
}

// Mock async function to fetch category name (replace with actual implementation)
async function fetchCategoryName(slug: string): Promise<string> {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 100));
  // Example: 'electronics' slug maps to 'Electronics' label
  if (slug === 'electronics') {
    return 'Electronics';
  }
  return slug.charAt(0).toUpperCase() + slug.slice(1); // Default to capitalized slug
}

// Mock async function to fetch product name (replace with actual implementation)
async function fetchProductName(id: string): Promise<string> {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 100));
  // Example: Product ID '123' maps to 'Awesome Gadget'
  if (id === '123') {
    return 'Awesome Gadget';
  }
  return `Product ${id}`; // Default to 'Product {id}'
}

export async function buildBreadcrumbs(
  pathname: string,
  query: BreadcrumbQuery
): Promise<BreadcrumbSegment[]> {
  const segments: BreadcrumbSegment[] = [{ label: 'Home', href: '/' }];
  const pathParts = pathname.split('/').filter(part => part);

  if (pathParts.length === 0) {
    return segments; // Only Home breadcrumb
  }

  let currentPath = '';

  for (let i = 0; i < pathParts.length; i++) {
    const part = pathParts[i];
    currentPath += `/${part}`;

    if (part === 'category' && pathParts[i + 1]) {
      const categorySlug = pathParts[i + 1];
      const categoryName = await fetchCategoryName(categorySlug);
      segments.push({ label: categoryName, href: `/category/${categorySlug}` });
      i++; // Skip next part as it's part of the category
      currentPath += `/${categorySlug}`;
    } else if (part === 'product' && pathParts[i + 1]) {
      const productId = pathParts[i + 1];
      const productName = await fetchProductName(productId);
      // Assuming product URLs might be nested under a category
      // If there's a category in the path already, we use it
      const categorySegment = segments.find(s => s.href.startsWith('/category/'));
      if (categorySegment) {
         segments.push({ label: productName, href: `${categorySegment.href}/product/${productId}` });
      } else {
        // Fallback if no category in path, though ideally product routes are nested
        segments.push({ label: productName, href: `/product/${productId}` });
      }
      i++; // Skip next part as it's part of the product
      currentPath += `/${productId}`;
    } else if (query.name && (currentPath === `/${part}` || currentPath === `/search/${part}`)) {
      // Example for a generic page that might pass a name in query
      // Or a search page where 'part' is the search term
      segments.push({ label: query.name, href: currentPath });
    }
     else {
      // Generic segment
      segments.push({
        label: part.charAt(0).toUpperCase() + part.slice(1),
        href: currentPath,
      });
    }
  }

  return segments;
}

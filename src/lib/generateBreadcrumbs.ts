// src/lib/generateBreadcrumbs.ts
export interface BreadcrumbSegment {
  name: string;
  href: string;
}

const staticPathSegmentNames: Record<string, string> = {
  'category': 'Categories',
  'product': 'Products',
  'search': 'Search',
  'cart': 'Cart',
  'account': 'Account',
  'login': 'Login',
};

export function generateBreadcrumbs(
  pathname: string,
  dynamicSegmentsData?: {
    category?: { name: string; slug: string }; // Changed categoryName to category object
    productTitle?: string;
  }
): BreadcrumbSegment[] {
  const segments: BreadcrumbSegment[] = [{ name: 'Home', href: '/' }];
  const pathParts = pathname.split('/').filter(Boolean);

  let currentPath = '';
  pathParts.forEach((part, index) => {
    currentPath += `/${part}`;
    // Capitalize part if not in staticPathSegmentNames, also replacing hyphens with spaces
    let name = staticPathSegmentNames[part] || part.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());


    // Use dynamic names if provided for the current segment
    // For /category/[slug]
    if (pathParts[0] === 'category' && index === 1 && dynamicSegmentsData?.category?.name) {
      name = dynamicSegmentsData.category.name;
    } else if (pathParts[0] === 'product' && index === 1 && dynamicSegmentsData?.productTitle) {
      // This is for a URL like /product/[prod-slug]
      name = dynamicSegmentsData.productTitle;
    } else if (pathParts.length === 4 && pathParts[0] === 'category' && pathParts[2] === 'product' && index === 3 && dynamicSegmentsData?.productTitle) {
      // This is for a URL like /category/[cat-slug]/product/[prod-slug]
        name = dynamicSegmentsData.productTitle;
    }


    segments.push({ name, href: currentPath });
  });

  // Refinement for "Home / CategoryName / ProductName" for product pages like /product/[prod-slug]
  // This ensures a category breadcrumb is present if a product is viewed directly and its category is known
  if (pathname.startsWith('/product/') && pathParts.length === 2 && dynamicSegmentsData?.category?.name && dynamicSegmentsData?.category?.slug && dynamicSegmentsData?.productTitle) {
    const productSegmentIndex = segments.findIndex(seg => seg.href === currentPath); // currentPath here is /product/[prod-slug]
    // Use the actual category slug
    const categorySegment: BreadcrumbSegment = {
      name: dynamicSegmentsData.category.name,
      href: `/category/${dynamicSegmentsData.category.slug}`
    };
    // Add category segment if it's not already there
    // and if productSegmentIndex is valid (found the product segment)
    if (productSegmentIndex > 0 && !segments.some(s => s.href === categorySegment.href)) {
      segments.splice(productSegmentIndex, 0, categorySegment);
    }
  }
  const hasCategory = segments.some(s => s.href.startsWith('/category/'));
  if (hasCategory) {
    const productsIndex = segments.findIndex(s => s.name === 'Products');
    if (productsIndex > -1) {
        segments.splice(productsIndex, 1);
    }
  }
  return segments;
}

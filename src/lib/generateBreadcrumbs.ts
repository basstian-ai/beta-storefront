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
    categoryName?: string;
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
    if (pathParts[0] === 'category' && index === 1 && dynamicSegmentsData?.categoryName) {
      name = dynamicSegmentsData.categoryName;
    } else if (pathParts[0] === 'product' && index === 1 && dynamicSegmentsData?.productTitle) {
      // This is for a URL like /product/[id]
      name = dynamicSegmentsData.productTitle;
    } else if (pathParts.length === 4 && pathParts[0] === 'category' && pathParts[2] === 'product' && index === 3 && dynamicSegmentsData?.productTitle) {
      // This is for a URL like /category/[cat-slug]/product/[prod-slug]
        name = dynamicSegmentsData.productTitle;
    }


    segments.push({ name, href: currentPath });
  });

  // Refinement for "Home / CategoryName / ProductName" for product pages like /product/[id]
  // This ensures a category breadcrumb is present if a product is viewed directly and its category is known
  if (pathname.startsWith('/product/') && pathParts.length === 2 && dynamicSegmentsData?.categoryName && dynamicSegmentsData?.productTitle) {
    const productSegmentIndex = segments.findIndex(seg => seg.href === currentPath); // currentPath here is /product/[id]
    const categorySlug = dynamicSegmentsData.categoryName.toLowerCase().replace(/\s+/g, '-');
    const categorySegment: BreadcrumbSegment = {
      name: dynamicSegmentsData.categoryName,
      href: `/category/${categorySlug}`
    };
    // Add category segment if it's not already there (e.g. from staticPathSegmentNames if 'category' was part of URL)
    // and if productSegmentIndex is valid (found the product segment)
    if (productSegmentIndex > 0 && !segments.some(s => s.href === categorySegment.href)) {
      segments.splice(productSegmentIndex, 0, categorySegment);
    }
  }
  return segments;
}

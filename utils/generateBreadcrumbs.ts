// utils/generateBreadcrumbs.ts
import { useRouter } from 'next/router';

export const generateBreadcrumbs = () => {
  const router = useRouter();
  const pathSegments = router.pathname.split('/').filter((seg) => seg);

  const breadcrumbs = pathSegments.map((segment, index) => {
    const href = '/' + pathSegments.slice(0, index + 1).join('/');
    const label = segment.charAt(0).toUpperCase() + segment.slice(1); // Capitalize first letter
    return { href, label };
  });

  // Add a "Home" breadcrumb at the beginning
  return [{ href: '/', label: 'Home' }, ...breadcrumbs];
};

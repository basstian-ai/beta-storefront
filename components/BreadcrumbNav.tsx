// components/BreadcrumbNav.tsx
import { Breadcrumb } from '@digdir/designsystemet-react';
import Link from 'next/link';
import { generateBreadcrumbs } from '../utils/generateBreadcrumbs'; // Adjusted import path

const BreadcrumbNav = () => {
  const breadcrumbs = generateBreadcrumbs();

  return (
    <Breadcrumb>
      {breadcrumbs.map((crumb, index) => (
        <Breadcrumb.Item key={crumb.href}>
          {index === breadcrumbs.length - 1 ? (
            crumb.label // Last item is not a link
          ) : (
            <Link href={crumb.href}>{crumb.label}</Link>
          )}
        </Breadcrumb.Item>
      ))}
    </Breadcrumb>
  );
};

export default BreadcrumbNav;

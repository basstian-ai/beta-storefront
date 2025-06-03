// components/BreadcrumbNav.tsx
import { Breadcrumbs } from '@digdir/designsystemet-react';
import Link from 'next/link';
import { generateBreadcrumbs } from '../utils/generateBreadcrumbs';

const BreadcrumbNav = () => {
  const breadcrumbs = generateBreadcrumbs();

  return (
    <Breadcrumbs>
      {breadcrumbs.map((crumb, index) => (
        <Breadcrumbs.Item key={crumb.href}>
          {index === breadcrumbs.length - 1 ? (
            crumb.label // Last item is not a link
          ) : (
            <Link href={crumb.href}>{crumb.label}</Link>
          )}
        </Breadcrumbs.Item>
      ))}
    </Breadcrumbs>
  );
};

export default BreadcrumbNav;

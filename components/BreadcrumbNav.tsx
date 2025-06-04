// components/BreadcrumbNav.tsx
// import { Breadcrumbs } from '@digdir/designsystemet-react'; // Removed
import Link from 'next/link'; // Keep for now, might be used in a future custom breadcrumb
import { generateBreadcrumbs } from '../utils/generateBreadcrumbs'; // Keep for now

const BreadcrumbNav = () => {
  const breadcrumbs = generateBreadcrumbs(); // This can stay, data is generated

  // Original Breadcrumbs rendering commented out / replaced
  return (
    <div data-testid="breadcrumb-placeholder">
      {/* Breadcrumbs temporarily unavailable. Data: {JSON.stringify(breadcrumbs)} */}
      {/* Alternatively, render a simple list for debugging if needed, but placeholder is safer for now */}
      Breadcrumbs temporarily unavailable
    </div>
  );
};

export default BreadcrumbNav;

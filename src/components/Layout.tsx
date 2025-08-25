// components/Layout.tsx
import React from 'react'; // Import React
import NavBar from './NavBar';
import MobileMenu from './MobileMenu'; // Import MobileMenu
import { Category } from '@/types';

interface LayoutProps {
  categories: Category[]; // Categories are transformed for NavBar
  children: React.ReactNode;
}

const Layout = ({ categories, children }: LayoutProps) => (
  <>
    {/* Assuming Head might be added globally in _app.tsx or per-page */}
    <header className="main-site-header">
      {/* Both NavBar and MobileMenu are rendered directly. */}
      {/* CSS will handle their visibility based on screen size. */}
      <NavBar
        initialCategories={categories.map(({ name, slug }) => ({ name, slug }))}
        categoryError={null}
      />
      <MobileMenu categories={categories} />
    </header>
    <main>{children}</main>
    {/* Placeholder for a Footer */}
    {/* <footer>Footer content</footer> */}
    <style jsx>{`
      .main-site-header {
        /* Minimal styling for the header container itself. */
        /* On mobile, this header will contain the NavBar (logo + search)
           and the MobileMenu button. They need to be aligned. */
      }

      /* Styles for .desktop-nav-container and .mobile-nav-container are removed */
      /* as they are no longer used. */

      /* Media queries for showing/hiding NavBar and MobileMenu components themselves */
      /* will be handled by their respective styles or global styles. */

      /* Example for MobileMenu (or global styles): */
      /* @media (min-width: 768px) {
           .mobile-menu-container { display: none; }
         } */

      @media (max-width: 768px) {
        .main-site-header {
          display: flex;
          align-items: center;
          justify-content: space-between; /* This will push NavBar parts to left, MobileMenu to right */
          padding: 0 1rem; /* Example padding, adjust as needed */
          /* Add other styles like border-bottom if desired for mobile header */
        }
      }
    `}</style>
  </>
);

export default Layout;

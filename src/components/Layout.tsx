// components/Layout.tsx
import React from 'react'; // Import React
import Navbar from './Navbar';
import MobileMenu from './MobileMenu'; // Import MobileMenu
import { Category } from '../../types';

interface LayoutProps {
  categories: Category[]; // Assuming categories are still needed for Navbar
  children: React.ReactNode;
}

const Layout = ({ categories, children }: LayoutProps) => (
  <>
    {/* Assuming Head might be added globally in _app.tsx or per-page */}
    <header className="main-site-header">
      {/* Both Navbar and MobileMenu are now rendered directly. */}
      {/* CSS will handle their visibility based on screen size. */}
      <Navbar categories={categories} />
      <MobileMenu categories={categories} />
    </header>
    <main>{children}</main>
    {/* Placeholder for a Footer */}
    {/* <footer>Footer content</footer> */}
    <style jsx>{`
      .main-site-header {
        /* Minimal styling for the header container itself. */
        /* On mobile, this header will contain the modified Navbar (logo + search)
           and the MobileMenu button. They need to be aligned. */
      }

      /* Styles for .desktop-nav-container and .mobile-nav-container are removed */
      /* as they are no longer used. */

      /* Media queries for showing/hiding Navbar and MobileMenu components themselves */
      /* will be handled by their respective CSS (e.g., Navbar.module.css and MobileMenu's styles) */
      /* or global styles. For instance: */

      /* In Navbar.module.css (or global): */
      /* @media (max-width: 767px) { */
      /*   .navbar { (.your-navbar-main-class) */
      /*     display: none;  -- This would hide the whole navbar on mobile */
      /*   } */
      /* } */

      /* In MobileMenu's style (or global): */
      /* @media (min-width: 768px) { */
      /*   .mobile-menu-container { (.your-mobile-menu-main-class) */
      /*     display: none; -- This would hide the mobile menu on desktop */
      /*   } */
      /* } */

      @media (max-width: 768px) {
        .main-site-header {
          display: flex;
          align-items: center;
          justify-content: space-between; /* This will push Navbar parts to left, MobileMenu to right */
          padding: 0 1rem; /* Example padding, adjust as needed */
          /* Add other styles like border-bottom if desired for mobile header */
        }
      }
    `}</style>
  </>
);

export default Layout;

// components/Layout.tsx
import React from 'react'; // Import React
import Navbar from './Navbar';
import MobileMenu from './MobileMenu'; // Import MobileMenu
import { Category } from '../types';

interface LayoutProps {
  categories: Category[]; // Assuming categories are still needed for Navbar
  children: React.ReactNode;
}

const Layout = ({ categories, children }: LayoutProps) => (
  <>
    {/* Assuming Head might be added globally in _app.tsx or per-page */}
    <header className="main-site-header">
      <div className="desktop-nav-container">
        <Navbar categories={categories} />
      </div>
      <div className="mobile-nav-container">
        <MobileMenu categories={categories} />
      </div>
    </header>
    <main>{children}</main>
    {/* Placeholder for a Footer */}
    {/* <footer>Footer content</footer> */}
    <style jsx>{`
      .main-site-header {
        /* Styles removed: display: flex, justify-content, align-items, padding, background-color */
        /* The Navbar component now handles its own background and internal layout. */
        /* A border or shadow might be added here if desired for the entire header, */
        /* but Navbar already has a box-shadow. */
      }

      .desktop-nav-container {
        display: none; /* Hidden on mobile by default */
      }
      .mobile-nav-container {
        display: block; /* Shown on mobile by default */
      }

      /* Desktop and larger screens */
      @media (min-width: 768px) { /* Adjust breakpoint as needed */
        .desktop-nav-container {
          display: block;
        }
        .mobile-nav-container {
          display: none;
        }
        /* .main-site-header might still need some minimal styling if there were other elements */
        /* directly within it, but for now, it's just a container for nav components. */
      }

      /* MobileMenu specific styling (if any) would be in MobileMenu.module.css or similar */
      /* The .mobile-nav-container itself doesn't need much if MobileMenu handles its own appearance. */
    `}</style>
  </>
);

export default Layout;

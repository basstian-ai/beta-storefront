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
    <header className="main-site-header"> {/* Added a class for the header */}
      {/* Placeholder for a Logo, could be added here */}
      {/* <div className="logo-container">Logo</div> */}

      <div className="desktop-nav-container">
        <Navbar categories={categories} />
      </div>
      <div className="mobile-nav-container">
        {/* Pass categories to MobileMenu */}
        <MobileMenu />
      </div>
    </header>
    <main>{children}</main>
    {/* Placeholder for a Footer */}
    {/* <footer>Footer content</footer> */}
    <style jsx>{`
      .main-site-header {
        display: flex;
        justify-content: space-between; /* Adjust as needed, might be right-aligned for mobile menu */
        align-items: center;
        padding: 1rem;
        background-color: #f0f0f0; /* Example background */
        /* Add other header styles as needed, e.g., border-bottom */
      }

      .desktop-nav-container {
        display: none; /* Hidden on mobile by default */
      }
      .mobile-nav-container {
        display: block; /* Shown on mobile by default */
        /* Ensure it's positioned correctly, e.g., if header is flex */
      }

      /* Desktop and larger screens */
      @media (min-width: 768px) { /* Adjust breakpoint as needed */
        .desktop-nav-container {
          display: block; /* Or flex, inline-block, etc. depending on Navbar's own styling */
        }
        .mobile-nav-container {
          display: none;
        }
        .main-site-header {
          /* Example: ensure Navbar is spaced out if logo is present */
          /* justify-content: space-between; */
        }
      }

      /* Further adjustments for mobile if logo is present and menu needs to be on the right */
      /* For example:
      .main-site-header {
        justify-content: space-between; // Logo on left, menu icon on right
      }
      .mobile-nav-container {
        // No specific change if it's just the button.
        // The DropdownMenu itself will position absolutely/fixed.
      }
      */
    `}</style>
  </>
);

export default Layout;

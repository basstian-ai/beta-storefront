// components/MobileMenu.tsx
import React, { useState } from 'react';
import { useRouter } from 'next/router';
// Link import is not strictly needed if we use router.push() for all navigation and divs for clickable items.
// However, if some items were to remain actual <Link>s, it would be kept.
// For this implementation, focusing on div onClick, it's not used.
// import Link from 'next/link';
import { Category } from '../types';

interface MobileMenuProps {
  categories: Category[];
}

const MobileMenu = ({ categories }: MobileMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleNavigation = (path: string) => {
    router.push(path);
    setIsOpen(false); // Close menu on navigation
  };

  return (
    <div className="mobile-menu-container">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
        className="mobile-menu-button"
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="24" height="24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="24" height="24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        )}
      </button>

      {isOpen && (
        <div className="mobile-menu-drawer" data-testid="mobile-menu-drawer">
          <div onClick={() => handleNavigation('/')} className="menu-item">
            Home
          </div>
          {categories.map(cat => (
            <div key={cat.id} onClick={() => handleNavigation(`/category/${cat.slug}`)} className="menu-item">
              {cat.name}
            </div>
          ))}
          <div onClick={() => handleNavigation('/products')} className="menu-item">
            Products
          </div>
          <div onClick={() => handleNavigation('/cart')} className="menu-item">
            Cart
          </div>
        </div>
      )}

      <style jsx>{`
        .mobile-menu-container {
          position: relative;
          /* Ensure it has a defined stacking context if z-index is used heavily elsewhere */
        }
        .mobile-menu-button {
          background: none;
          border: none;
          padding: 0.5rem;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: #333; /* SVG inherits this via stroke="currentColor" */
          /* Consider adding a z-index if it might be overlapped by other positioned elements when closed */
        }
        .mobile-menu-drawer {
          position: absolute;
          top: 100%; /* Position below the trigger */
          left: 0; /* Align to the left of the container */
          background-color: white;
          border: 1px solid #ccc;
          padding: 0.5rem;
          z-index: 1000; /* Ensure it's above other content */
          min-width: 150px;
          display: flex;
          flex-direction: column;
          gap: 0.25rem; /* Consistent with the example, smaller gap */
        }
        .menu-item { /* Renamed from .menu-item-like for clarity */
          display: block;
          padding: 0.5rem 1rem; /* Ensure items are easily clickable */
          text-decoration: none;
          color: #333;
          cursor: pointer;
          border-radius: 4px; /* Optional: slightly rounded corners for items */
        }
        .menu-item:hover {
          background-color: #f0f0f0;
        }
        /* Styling for SVGs if not directly handled by props, though width/height are on SVG elements */
        /* .mobile-menu-button svg {} */

        /* Hide MobileMenu on desktop */
        @media (min-width: 769px) { /* Consistent with hiding parts of Navbar at max-width: 768px */
          .mobile-menu-container {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default MobileMenu;

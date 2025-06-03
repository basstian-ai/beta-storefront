// components/MobileMenu.tsx
import React, { useState } from 'react';
import Link from 'next/link';
import { Dropdown, DropdownItem } from '@digdir/designsystemet-react'; // Updated import
import { Category } from '../types'; // Ensure Category type is imported

interface MobileMenuProps { // Define props
  categories: Category[];
}

const MobileMenu = ({ categories }: MobileMenuProps) => { // Use props
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mobile-menu-container">
      <Dropdown
        open={isOpen}
        onOpen={() => setIsOpen(true)}
        onClose={() => setIsOpen(false)}
      >
        <Dropdown.Trigger asChild>
          <button
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
        </Dropdown.Trigger>

        {/* This div acts as the Dropdown content panel */}
        {isOpen && (
          <div className="mobile-menu-drawer-ds" data-testid="mobile-menu-drawer">
            <DropdownItem asChild>
              <Link href="/">Home</Link>
            </DropdownItem>
            {/* Dynamically render category links */}
            {categories.map(cat => (
              <DropdownItem key={cat.id} asChild>
                <Link href={`/category/${cat.slug}`}>{cat.name}</Link>
              </DropdownItem>
            ))}
            <DropdownItem asChild>
              <Link href="/products">Products</Link>
            </DropdownItem>
            <DropdownItem asChild>
              <Link href="/cart">Cart</Link>
            </DropdownItem>
            {/* Add other DropdownItem as needed */}
          </div>
        )}
      </Dropdown>

      <style jsx>{`
        .mobile-menu-container {
          /* Styles will be added/refined in a later step for visibility based on screen size */
          position: relative; /* Needed for absolute positioning of the drawer */
        }
        .mobile-menu-button {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.5rem;
          color: #333; /* Dark color for SVG icon */
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        /* Styles for the Dropdown content div */
        .mobile-menu-drawer-ds {
          position: absolute; /* Ensure it can overlay */
          top: 100%; /* Position below the trigger */
          right: 0; /* Align to the right of the container */
          background-color: white;
          border: 1px solid #ccc;
          padding: 0.5rem;
          z-index: 1000;
          min-width: 150px;
        }
        /* Styling for Link components within DropdownItem */
        :global(.mobile-menu-drawer-ds a) {
          display: block;
          padding: 0.5rem 1rem; /* Ensure links are easily clickable */
          text-decoration: none;
          color: #333;
        }
        :global(.mobile-menu-drawer-ds a:hover) {
          background-color: #f0f0f0;
        }
      `}</style>
    </div>
  );
};

export default MobileMenu;

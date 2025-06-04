// components/MobileMenu.tsx
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Dropdown, DropdownItem } from '@digdir/designsystemet-react'; // Updated import
import { Category } from '../types'; // Ensure Category type is imported

interface MobileMenuProps { // Define props
  categories: Category[];
}

const MobileMenu = ({ categories }: MobileMenuProps) => { // Use props
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mobile-menu-container">
      <Dropdown
        open={isOpen}
        onOpen={() => setIsOpen(true)}
        onClose={() => setIsOpen(false)}
      >
        <Dropdown.Trigger
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
          className="mobile-hamburger-trigger"
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
        </Dropdown.Trigger>

        {/* This div acts as the Dropdown content panel */}
        {isOpen && (
          <div className="mobile-menu-drawer-ds" data-testid="mobile-menu-drawer">
            <DropdownItem onClick={() => router.push('/')}>Home</DropdownItem>
            {/* Dynamically render category links */}
            {categories.map(cat => (
              <DropdownItem key={cat.id} onClick={() => router.push(`/category/${cat.slug}`)}>{cat.name}</DropdownItem>
            ))}
            <DropdownItem onClick={() => router.push('/products')}>Products</DropdownItem>
            <DropdownItem onClick={() => router.push('/cart')}>Cart</DropdownItem>
            {/* Add other DropdownItem as needed */}
          </div>
        )}
      </Dropdown>

      <style jsx>{`
        .mobile-menu-container {
          /* Styles will be added/refined in a later step for visibility based on screen size */
          position: relative; /* Needed for absolute positioning of the drawer */
        }
        .mobile-hamburger-trigger {
          background: yellow !important;
          border: 1px solid red !important;
          color: black !important; /* For SVG currentColor */
          opacity: 1 !important;
          visibility: visible !important;
          z-index: 9999 !important;
          padding: 0.5rem !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          cursor: pointer !important;
        }
        :global(.mobile-hamburger-trigger > svg) {
          stroke: black !important;
          width: 24px !important;
          height: 24px !important;
          display: block !important;
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
      `}</style>
    </div>
  );
};

export default MobileMenu;

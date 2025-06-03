// components/MobileMenu.tsx
import React, { useState } from 'react';
import Link from 'next/link';
import { DropdownMenu } from '@digdir/designsystemet-react'; // Updated import

const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mobile-menu-container">
      <DropdownMenu
        open={isOpen}
        onOpen={() => setIsOpen(true)}
        onClose={() => setIsOpen(false)}
      > {/* Updated */}
        <DropdownMenu.Trigger asChild> {/* Updated */}
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
        </DropdownMenu.Trigger>

        <DropdownMenu.Content side="bottom" align="end" className="mobile-menu-drawer-ds"> {/* Updated */}
          <DropdownMenu.Item asChild> {/* Updated */}
            <Link href="/">Home</Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item asChild> {/* Updated */}
            <Link href="/products">Products</Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item asChild> {/* Updated */}
            <Link href="/cart">Cart</Link>
          </DropdownMenu.Item>
          {/* Add other DropdownMenu.Item as needed */}
        </DropdownMenu.Content>
      </DropdownMenu>

      <style jsx>{`
        .mobile-menu-container {
          /* Styles will be added/refined in a later step for visibility based on screen size */
        }
        .mobile-menu-button {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.5rem;
          display: inline-flex; /* Helps align SVG nicely */
          align-items: center;
          justify-content: center;
        }
        /* Styles for the DropdownMenu content */
        :global(.mobile-menu-drawer-ds) { /* Use :global for classes applied to Designsystemet components */
          background-color: white;
          border: 1px solid #ccc;
          padding: 0.5rem;
          z-index: 1000;
          min-width: 150px; /* Example */
          /* Ensure items are displayed as block for full-width clickability if needed */
        }
        :global(.mobile-menu-drawer-ds a), :global(.mobile-menu-drawer-ds button[role="menuitem"]) {
          /* Targeting links directly or buttons if DropdownMenu.Item renders a button for accessibility with asChild */
          display: block;
          padding: 0.5rem 1rem;
          text-decoration: none;
          color: #333;
          background: none;
          border: none;
          text-align: left;
          width: 100%;
        }
        :global(.mobile-menu-drawer-ds a:hover), :global(.mobile-menu-drawer-ds button[role="menuitem"]:hover) {
          background-color: #f0f0f0; /* Example hover */
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default MobileMenu;

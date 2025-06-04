// components/MobileMenu.tsx
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Dropdown, DropdownItem } from '@digdir/designsystemet-react';
import { Category } from '../types';

interface MobileMenuProps {
  categories: Category[];
}

const MobileMenu = ({ categories }: MobileMenuProps) => {
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
          variant="tertiary" // Added prop
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

        {isOpen && (
          <div className="mobile-menu-drawer-ds" data-testid="mobile-menu-drawer">
            <DropdownItem onClick={() => router.push('/')}>Home</DropdownItem>
            {categories.map(cat => (
              <DropdownItem key={cat.id} onClick={() => router.push(`/category/${cat.slug}`)}>{cat.name}</DropdownItem>
            ))}
            <DropdownItem onClick={() => router.push('/products')}>Products</DropdownItem>
            <DropdownItem onClick={() => router.push('/cart')}>Cart</DropdownItem>
          </div>
        )}
      </Dropdown>

      <style jsx>{`
        .mobile-menu-container {
          position: relative;
        }
        .mobile-hamburger-trigger {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.5rem;
          color: #333; /* Dark color for SVG icon */
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .mobile-menu-drawer-ds {
          position: absolute;
          top: 100%;
          right: 0;
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

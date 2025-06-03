// __tests__/components/MobileMenu.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MobileMenu from '@/components/MobileMenu'; // Adjust path as necessary
import '@testing-library/jest-dom';

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode, href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

// Mock for Dropdown and DropdownItem
jest.mock('@digdir/designsystemet-react', () => {
  const originalModule = jest.requireActual('@digdir/designsystemet-react');

  type DropdownComponent = React.FC<any> & {
    Trigger?: React.FC<any>;
    // No Content sub-component on Dropdown itself in the new structure
  };

  type DropdownItemComponent = React.FC<any>;

  // Store onOpen and onClose from props for Dropdown
  let currentOnOpen: (() => void) | null = null;
  let currentOnClose: (() => void) | null = null;
  let currentIsOpen: boolean = false;

  const MockDropdown: DropdownComponent = jest.fn(({ children, open, onOpen, onClose }) => {
    currentIsOpen = open;
    currentOnOpen = onOpen;
    currentOnClose = onClose;

    let trigger: React.ReactNode = null;
    let content: React.ReactNode = null;

    // In the new structure, Dropdown's children are Trigger and the content div (conditionally rendered).
    // The mock Dropdown just needs to render its children.
    // The visibility of the content div is handled by MobileMenu.tsx itself.
    // We only need to ensure the Trigger child is correctly processed.

    let triggerChild: React.ReactNode = null;
    let otherChildren: React.ReactNode[] = [];

    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child)) {
        // Assuming the first child is Dropdown.Trigger
        // A more robust check could be child.type === MockDropdown.Trigger or based on displayName
        if (!triggerChild && child.type && (child.type as any).displayName === 'Dropdown.Trigger') {
          triggerChild = child;
        } else {
          otherChildren.push(child); // This will include the conditionally rendered div
        }
      } else {
        otherChildren.push(child);
      }
    });

    return (
      <div>
        {triggerChild}
        {/* Render other children directly as MobileMenu handles their conditional rendering */}
        {otherChildren}
      </div>
    );
  });

  MockDropdown.Trigger = jest.fn(({ children, asChild }) => {
    const newOnClick = () => {
      if (currentIsOpen && currentOnClose) {
        currentOnClose();
      } else if (!currentIsOpen && currentOnOpen) {
        currentOnOpen();
      }
    };

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, { ...children.props, onClick: newOnClick });
    }
    return <button onClick={newOnClick}>{children}</button>;
  });
  MockDropdown.Trigger.displayName = 'Dropdown.Trigger';


  const MockDropdownItem: DropdownItemComponent = jest.fn(({ children, asChild, ...props }) => {
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, { ...children.props, ...props });
    }
    return <div {...props}>{children}</div>; // DropdownItem usually renders a div or li
  });
  // MockDropdownItem.displayName = 'DropdownItem'; // Optional: for debugging

  return {
    ...originalModule,
    Dropdown: MockDropdown,
    DropdownItem: MockDropdownItem,
  };
});


describe('MobileMenu', () => {
  it('renders and is initially closed', () => {
    render(<MobileMenu />);
    const openButton = screen.getByRole('button', { name: /open menu/i });
    expect(openButton).toBeInTheDocument();
    expect(openButton).toHaveAttribute('aria-expanded', 'false');
    // Content should not be visible. Using queryByTestId because it returns null if not found.
    expect(screen.queryByTestId('mobile-menu-drawer')).not.toBeInTheDocument();
  });

  it('opens and closes the menu on button click', () => {
    render(<MobileMenu />);
    const button = screen.getByRole('button', { name: /open menu/i });

    // Open menu
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    // The name might change to "Close menu" due to the aria-label logic in the component
    expect(screen.getByRole('button', { name: /close menu/i })).toBeInTheDocument();
    expect(screen.getByTestId('mobile-menu-drawer')).toBeVisible();

    // Close menu
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByRole('button', { name: /open menu/i })).toBeInTheDocument();
    expect(screen.queryByTestId('mobile-menu-drawer')).not.toBeInTheDocument();
  });

  it('shows navigation links when open', () => {
    render(<MobileMenu />);
    const button = screen.getByRole('button', { name: /open menu/i });

    // Open menu
    fireEvent.click(button);

    const drawer = screen.getByTestId('mobile-menu-drawer');
    expect(drawer).toBeVisible();

    const homeLink = screen.getByRole('link', { name: /home/i });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/');

    const productsLink = screen.getByRole('link', { name: /products/i });
    expect(productsLink).toBeInTheDocument();
    expect(productsLink).toHaveAttribute('href', '/products');

    const cartLink = screen.getByRole('link', { name: /cart/i });
    expect(cartLink).toBeInTheDocument();
    expect(cartLink).toHaveAttribute('href', '/cart');
  });
});

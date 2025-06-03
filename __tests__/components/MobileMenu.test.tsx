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

// A more robust mock for DropdownMenu and its sub-components:
jest.mock('@digdir/designsystemet-react', () => {
  const originalModule = jest.requireActual('@digdir/designsystemet-react');

  type DropdownMenuComponent = React.FC<any> & { // Changed type name back
    Trigger?: React.FC<any>;
    Content?: React.FC<any>;
    Item?: React.FC<any>;
  };

  // Store onOpen and onClose from props
  let currentOnOpen: (() => void) | null = null;
  let currentOnClose: (() => void) | null = null;
  let currentIsOpen: boolean = false; // Keep track of internal state for the mock

  const MockDropdownMenu: DropdownMenuComponent = jest.fn(({ children, open, onOpen, onClose }) => { // Changed const name back
    currentIsOpen = open; // The component's state is still the source of truth for 'open'
    currentOnOpen = onOpen;
    currentOnClose = onClose;

    let trigger: React.ReactNode = null;
    let content: React.ReactNode = null;

    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child)) {
        // Simplified: first child is trigger, second is content
        // A more robust way would be to check child.type.displayName or a specific prop.
        if (!trigger) {
            // Check if this child is intended to be the Trigger
            // For this mock, we assume the Trigger component will eventually render a button or similar clickable element.
            // The actual props of the child (like asChild) are handled by MockDropdownMenu.Trigger
            trigger = child;
        }
        else if (!content) {
            content = child;
        }
      }
    });
    return (
      <div>
        {trigger}
        {currentIsOpen && content}
      </div>
    );
  });

  MockDropdownMenu.Trigger = jest.fn(({ children, asChild }) => { // Changed name back
    const newOnClick = () => {
      // Simulate the toggle behavior
      if (currentIsOpen && currentOnClose) {
        currentOnClose();
      } else if (!currentIsOpen && currentOnOpen) {
        currentOnOpen();
      }
    };

    if (asChild && React.isValidElement(children)) {
      // Children is the actual <button> from MobileMenu.tsx
      // Clone it and override/set its onClick.
      // Ensure other props from the original button (like aria-label, className) are preserved.
      return React.cloneElement(children, { ...children.props, onClick: newOnClick });
    }
    // Fallback: if not asChild, render a new button.
    // This case should not be hit by MobileMenu.tsx's usage.
    return <button onClick={newOnClick}>{children}</button>;
  });
  MockDropdownMenu.Trigger.displayName = 'DropdownMenu.Trigger'; // Changed name back


  MockDropdownMenu.Content = jest.fn(({ children, ...props }) => ( // Changed name back
    <div {...props} data-testid="mobile-menu-drawer">
      {children}
    </div>
  ));
  MockDropdownMenu.Content.displayName = 'DropdownMenu.Content'; // Changed name back

  MockDropdownMenu.Item = jest.fn(({ children, asChild, ...props }) => { // Changed name back
    if (asChild && React.isValidElement(children)) {
      // children is <Link href="/">Home</Link>
      // We need to pass props like className, role if DropdownMenu.Item adds them.
      return React.cloneElement(children, {...children.props, ...props});
    }
    return <li {...props}>{children}</li>; // Fallback
  });
  MockDropdownMenu.Item.displayName = 'DropdownMenu.Item'; // Changed name back

  return {
    ...originalModule,
    DropdownMenu: MockDropdownMenu, // Export the mock as DropdownMenu
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

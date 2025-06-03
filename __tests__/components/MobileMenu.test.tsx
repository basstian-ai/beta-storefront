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

  type DropdownMenuComponent = React.FC<any> & {
    Trigger?: React.FC<any>;
    Content?: React.FC<any>;
    Item?: React.FC<any>;
  };

  // This is the function that will be called by the Trigger
  let currentOnOpenChange: ((open: boolean) => void) | null = null;
  let currentIsOpen: boolean = false;

  const MockDropdownMenu: DropdownMenuComponent = jest.fn(({ children, open, onOpenChange }) => {
    currentIsOpen = open;
    currentOnOpenChange = onOpenChange; // Store onOpenChange

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

  MockDropdownMenu.Trigger = jest.fn(({ children, asChild, ...props_passed_to_trigger_component }) => {
    // These are the props for the actual element that gets rendered (e.g. button)
    const triggerElementProps = {
      // ...props_passed_to_trigger_component, // these are props for the Trigger component itself
      onClick: () => {
        if (currentOnOpenChange) {
          currentOnOpenChange(!currentIsOpen); // Call the stored onOpenChange
        }
      },
    };

    if (asChild && React.isValidElement(children)) {
      // children is the <button> from MobileMenu.tsx
      // We need to merge its existing props (like aria-label, className)
      // with the onClick handler we want the mock to enforce.
      return React.cloneElement(children, { ...children.props, ...triggerElementProps });
    }
    // Fallback if not asChild (though MobileMenu uses asChild)
    return <button {...triggerElementProps}>{children}</button>;
  });
  MockDropdownMenu.Trigger.displayName = 'DropdownMenu.Trigger';


  MockDropdownMenu.Content = jest.fn(({ children, ...props }) => (
    <div {...props} data-testid="mobile-menu-drawer">
      {children}
    </div>
  ));
  MockDropdownMenu.Content.displayName = 'DropdownMenu.Content';

  MockDropdownMenu.Item = jest.fn(({ children, asChild, ...props }) => {
    if (asChild && React.isValidElement(children)) {
      // children is <Link href="/">Home</Link>
      // We need to pass props like className, role if DropdownMenu.Item adds them.
      return React.cloneElement(children, {...children.props, ...props});
    }
    return <li {...props}>{children}</li>; // Fallback
  });
  MockDropdownMenu.Item.displayName = 'DropdownMenu.Item';

  return {
    ...originalModule,
    DropdownMenu: MockDropdownMenu,
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

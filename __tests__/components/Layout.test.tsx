import React from 'react';
import { render, screen } from '@testing-library/react';
import Layout from '../../components/Layout';
import { Category } from '../../types';
import '@testing-library/jest-dom';

// Mock Navbar component
jest.mock('../../components/Navbar', () => {
  return function DummyNavbar({ categories }: { categories: Category[] }) {
    return (
      <div data-testid="navbar">
        {categories.map(cat => <span key={cat.id}>{cat.name}</span>)}
      </div>
    );
  };
});

// Mock MobileMenu component
jest.mock('../../components/MobileMenu', () => {
  return function DummyMobileMenu() {
    return <div data-testid="mobile-menu">Mobile Menu</div>;
  };
});

// Mock @digdir/designsystemet-react for Dropdown and DropdownItem used in MobileMenu
jest.mock('@digdir/designsystemet-react', () => {
  const originalModule = jest.requireActual('@digdir/designsystemet-react');

  type DropdownComponent = React.FC<any> & {
    Trigger?: React.FC<any>;
    // No Content sub-component
  };
  type DropdownItemComponent = React.FC<any>;


  // Store onOpen and onClose from props for the mock
  let currentOnOpen: (() => void) | null = null;
  let currentOnClose: (() => void) | null = null;
  let currentIsOpen: boolean = false;

  const MockDropdown: DropdownComponent = jest.fn(({ children, open, onOpen, onClose }) => { // Updated
    currentIsOpen = open;
    currentOnOpen = onOpen;
    currentOnClose = onClose;

    let trigger: React.ReactNode = null;
    let content: React.ReactNode = null;
    // Simplified render for Layout test - MobileMenu is already mocked directly.
    // This mock just needs to provide the named exports Dropdown and DropdownItem.
    let triggerChild: React.ReactNode = null;
    let otherChildren: React.ReactNode[] = [];
     React.Children.forEach(children, (child) => {
      if (React.isValidElement(child) && child.type && (child.type as any).displayName === 'Dropdown.Trigger') {
        triggerChild = child;
      } else {
        otherChildren.push(child);
      }
    });
    return <div>{triggerChild}{otherChildren}</div>;
  });

  MockDropdown.Trigger = jest.fn(({ children, asChild }) => { // Updated
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
  MockDropdown.Trigger.displayName = 'Dropdown.Trigger'; // Updated

  const MockDropdownItem: DropdownItemComponent = jest.fn(({ children, asChild, ...props }) => { // Updated
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, { ...children.props, ...props });
    }
    return <div {...props}>{children}</div>; // Or <li>
  });

  return {
    ...originalModule,
    Dropdown: MockDropdown, // Export Updated
    DropdownItem: MockDropdownItem, // Export New
  };
});


describe('Layout', () => {
  const mockCategories: Category[] = [
    { id: '1', name: 'Electronics', slug: 'electronics' },
    { id: '2', name: 'Books', slug: 'books' },
  ];

  it('renders Navbar with categories and children', () => {
    render(
      <Layout categories={mockCategories}>
        <div data-testid="child-content">Hello World</div>
      </Layout>
    );

    // Check if Navbar is rendered
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByText('Electronics')).toBeInTheDocument();
    expect(screen.getByText('Books')).toBeInTheDocument();

    // Check if MobileMenu mock is rendered
    expect(screen.getByTestId('mobile-menu')).toBeInTheDocument();
    expect(screen.getByText('Mobile Menu')).toBeInTheDocument();


    // Check if children are rendered
    expect(screen.getByTestId('child-content')).toHaveTextContent('Hello World');
  });
});

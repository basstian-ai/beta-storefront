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

// Mock @digdir/designsystemet-react for DropdownMenu used in MobileMenu
jest.mock('@digdir/designsystemet-react', () => {
  const originalModule = jest.requireActual('@digdir/designsystemet-react');

  type DropdownMenuComponent = React.FC<any> & {
    Trigger?: React.FC<any>;
    Content?: React.FC<any>;
    Item?: React.FC<any>;
  };

  let currentOnOpenChange: ((open: boolean) => void) | null = null;
  let currentIsOpen: boolean = false;

  const MockDropdownMenu: DropdownMenuComponent = jest.fn(({ children, open, onOpenChange }) => {
    currentIsOpen = open;
    currentOnOpenChange = onOpenChange;

    let trigger: React.ReactNode = null;
    let content: React.ReactNode = null;
    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child)) {
        if (!trigger) trigger = child;
        else if (!content) content = child;
      }
    });
    return <div>{trigger}{currentIsOpen && content}</div>;
  });

  MockDropdownMenu.Trigger = jest.fn(({ children, asChild, ...props }) => {
    const triggerElementProps = {
      onClick: () => {
        if (currentOnOpenChange) currentOnOpenChange(!currentIsOpen);
      },
    };
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, { ...children.props, ...triggerElementProps });
    }
    return <button {...triggerElementProps}>{children}</button>;
  });
  MockDropdownMenu.Trigger.displayName = 'DropdownMenu.Trigger';

  MockDropdownMenu.Content = jest.fn(({ children, ...props }) => <div {...props} data-testid="mobile-menu-drawer">{children}</div>);
  MockDropdownMenu.Content.displayName = 'DropdownMenu.Content';

  MockDropdownMenu.Item = jest.fn(({ children, asChild, ...props }) => {
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, { ...children.props, ...props });
    }
    return <li {...props}>{children}</li>;
  });
  MockDropdownMenu.Item.displayName = 'DropdownMenu.Item';

  return {
    ...originalModule,
    DropdownMenu: MockDropdownMenu,
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

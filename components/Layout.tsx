import Navbar from './Navbar';
import { Category } from '../types';
import React from 'react'; // Import React

interface LayoutProps {
  categories: Category[];
  children: React.ReactNode;
}

const Layout = ({ categories, children }: LayoutProps) => (
  <>
    <Navbar categories={categories} />
    <main>{children}</main>
  </>
);

export default Layout;

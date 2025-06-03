import React from 'react';
import Layout from '../components/Layout';
import { fetchCategories } from '../lib/api';
import { Category } from '../types';
import BreadcrumbNav from '../components/BreadcrumbNav'; // Import BreadcrumbNav
import { GetServerSidePropsContext } from 'next';

interface ProductsPageProps {
  categories: Category[];
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  let categories: Category[] = [];
  try {
    categories = await fetchCategories();
  } catch (error) {
    console.error("Error fetching categories for Products page:", error);
  }
  return { props: { categories } };
}

const ProductsPage = ({ categories }: ProductsPageProps) => {
  return (
    <Layout categories={categories}>
      <BreadcrumbNav /> {/* Add BreadcrumbNav */}
      <div>
        <h1>Products Page</h1>
        <p>This is a placeholder for the products page.</p>
      </div>
    </Layout>
  );
};

export default ProductsPage;

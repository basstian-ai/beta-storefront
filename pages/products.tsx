import React from 'react';
import Layout from '../components/Layout';
import { fetchCategories } from '../lib/api';
import { Category } from '../types';
import Breadcrumb from '../components/Breadcrumb'; // Correct path
import { buildBreadcrumbs } from '../lib/buildBreadcrumbs'; // Correct path
import { GetServerSidePropsContext } from 'next';

interface ProductsPageProps {
  categories: Category[];
  breadcrumbs: Awaited<ReturnType<typeof buildBreadcrumbs>>;
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  let categories: Category[] = [];
  try {
    categories = await fetchCategories();
  } catch (error) {
    console.error("Error fetching categories for Products page:", error);
  }
  const breadcrumbs = await buildBreadcrumbs(context.resolvedUrl, context.query);
  return { props: { categories, breadcrumbs } };
}

const ProductsPage = ({ categories, breadcrumbs }: ProductsPageProps) => {
  return (
    <Layout categories={categories}>
      <Breadcrumb segments={breadcrumbs} />
      <div>
        <h1>Products Page</h1>
        <p>This is a placeholder for the products page.</p>
      </div>
    </Layout>
  );
};

export default ProductsPage;

import React from 'react';
import Layout from '../components/Layout';
import { fetchCategories } from '../lib/api';
import { Category } from '../types';
import Breadcrumb from '../components/Breadcrumb'; // Correct path
import { buildBreadcrumbs } from '../lib/buildBreadcrumbs'; // Correct path
import { GetServerSidePropsContext } from 'next';

interface CartPageProps {
  categories: Category[];
  breadcrumbs: Awaited<ReturnType<typeof buildBreadcrumbs>>;
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  let categories: Category[] = [];
  try {
    categories = await fetchCategories();
  } catch (error) {
    console.error("Error fetching categories for Cart page:", error);
  }
  const breadcrumbs = await buildBreadcrumbs(context.resolvedUrl, context.query);
  return { props: { categories, breadcrumbs } };
}

const CartPage = ({ categories, breadcrumbs }: CartPageProps) => {
  return (
    <Layout categories={categories}>
      <Breadcrumb segments={breadcrumbs} />
      <div>
        <h1>Cart Page</h1>
        <p>This is a placeholder for the cart page.</p>
      </div>
    </Layout>
  );
};

export default CartPage;

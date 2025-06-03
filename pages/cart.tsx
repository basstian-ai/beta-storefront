import React from 'react';
import Layout from '../components/Layout';
import { fetchCategories } from '../lib/api';
import { Category } from '../types';

interface CartPageProps {
  categories: Category[];
}

export async function getServerSideProps() {
  let categories: Category[] = [];
  try {
    categories = await fetchCategories();
  } catch (error) {
    console.error("Error fetching categories for Cart page:", error);
  }
  return { props: { categories } };
}

const CartPage = ({ categories }: CartPageProps) => {
  return (
    <Layout categories={categories}>
      <div>
        <h1>Cart Page</h1>
        <p>This is a placeholder for the cart page.</p>
      </div>
    </Layout>
  );
};

export default CartPage;

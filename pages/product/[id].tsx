import { GetServerSidePropsContext } from 'next';
import Layout from '@/components/Layout';
import BreadcrumbNav from '@/components/BreadcrumbNav';
import { fetchCategories, fetchProductById } from '@/lib/api';
import type { Category, Product } from '@/types';

interface ProductPageProps {
  categories: Category[];
  product: Product;
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { id } = context.params ?? {};
  let categories: Category[] = [];
  let product: Product | null = null;

  try {
    categories = await fetchCategories();
    if (typeof id === 'string') {
      product = await fetchProductById(id);
    }
  } catch (error) {
    console.error('Error loading product page:', error);
  }

  if (!product) {
    return { notFound: true };
  }

  return { props: { categories, product } };
}

export default function ProductPage({ categories, product }: ProductPageProps) {
  return (
    <Layout categories={categories}>
      <BreadcrumbNav />
      <div>
        <h1>{product.name}</h1>
        <p>Price: {product.price}</p>
      </div>
    </Layout>
  );
}

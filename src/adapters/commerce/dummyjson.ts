import { CommerceAdapter } from './types';
import {
  fetchAllProductsSimple,
  fetchProducts,
  fetchProductById,
  fetchCategories,
  createCheckoutSession,
} from '@/lib/services/dummyjson';
import { fetchData } from '@/utils/fetchData';

const dummyJsonCommerceAdapter: CommerceAdapter = {
  fetchAllProductsSimple,
  fetchProducts,
  fetchProductById,
  fetchCategories,
  fetchOrders: () => fetchData('https://dummyjson.com/carts'),
  createCheckoutSession,
};

export default dummyJsonCommerceAdapter;

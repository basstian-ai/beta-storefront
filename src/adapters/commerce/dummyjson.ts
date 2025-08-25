import { CommerceAdapter } from './types';
import {
  fetchAllProductsSimple,
  fetchProducts,
  fetchProductById,
  fetchCategories,
} from '@/lib/services/dummyjson';
import { fetchData } from '@/utils/fetchData';

const dummyJsonCommerceAdapter: CommerceAdapter = {
  fetchAllProductsSimple,
  fetchProducts,
  fetchProductById,
  fetchCategories,
  fetchOrders: () => fetchData('https://dummyjson.com/carts'),
};

export default dummyJsonCommerceAdapter;

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
  fetchOrders: async () => {
    const { data, error } = await fetchData<unknown>('https://dummyjson.com/carts');
    if (error || !data) {
      throw error;
    }
    return data;
  },
  createCheckoutSession,
};

export default dummyJsonCommerceAdapter;

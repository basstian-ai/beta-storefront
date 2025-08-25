import { CMSAdapter } from './index';
import { fetchData } from '@/utils/fetchData';

const dummyJsonCMSAdapter: CMSAdapter = {
  getContent: async () => {
    const { data, error } = await fetchData<unknown>('https://dummyjson.com/posts');
    if (error || !data) {
      throw error;
    }
    return data;
  },
};

export default dummyJsonCMSAdapter;

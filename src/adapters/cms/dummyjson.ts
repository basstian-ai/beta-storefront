import { CMSAdapter } from './index';
import { fetchData } from '@/utils/fetchData';

const dummyJsonCMSAdapter: CMSAdapter = {
  getContent: () => fetchData('https://dummyjson.com/posts'),
};

export default dummyJsonCMSAdapter;

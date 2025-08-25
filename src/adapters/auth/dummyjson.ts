import { AuthAdapter } from './index';
import { login, DummyJsonLoginApiSchema } from '@/lib/services/dummyjson';
import { fetchData } from '@/utils/fetchData';

const dummyJsonAuthAdapter: AuthAdapter = {
  getUsers: () => fetchData('https://dummyjson.com/users'),
  login,
};

export { DummyJsonLoginApiSchema };
export default dummyJsonAuthAdapter;

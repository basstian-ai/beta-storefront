import { AuthAdapter } from './index';
import { login, DummyJsonLoginApiSchema, fetchUser } from '@/lib/services/dummyjson';
import { fetchData } from '@/utils/fetchData';

const dummyJsonAuthAdapter: AuthAdapter = {
  getUsers: () => fetchData('https://dummyjson.com/users'),
  login,
  getUser: fetchUser,
};

export { DummyJsonLoginApiSchema };
export default dummyJsonAuthAdapter;

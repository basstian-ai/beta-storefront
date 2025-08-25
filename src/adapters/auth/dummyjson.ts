import { AuthAdapter } from './index';
import { login, DummyJsonLoginApiSchema, fetchUser } from '@/lib/services/dummyjson';
import { fetchData } from '@/utils/fetchData';

const dummyJsonAuthAdapter: AuthAdapter = {
  getUsers: async () => {
    const { data, error } = await fetchData<unknown>('https://dummyjson.com/users');
    if (error || !data) {
      throw error;
    }
    return data;
  },
  login,
  getUser: fetchUser,
};

export { DummyJsonLoginApiSchema };
export default dummyJsonAuthAdapter;

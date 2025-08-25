export interface AuthAdapter {
  getUsers(): Promise<unknown>;
  login(credentials: { username: string; password: string }): Promise<unknown>;
}

import dummyJsonAuthAdapter from './dummyjson';
export { DummyJsonLoginApiSchema } from './dummyjson';

export const authAdapter: AuthAdapter = dummyJsonAuthAdapter;
export default authAdapter;

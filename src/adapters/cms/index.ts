export interface CMSAdapter {
  getContent(): Promise<unknown>;
}

import dummyJsonCMSAdapter from './dummyjson';

export const cmsAdapter: CMSAdapter = dummyJsonCMSAdapter;
export default cmsAdapter;

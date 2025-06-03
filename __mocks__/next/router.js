import { jest } from '@jest/globals';

export const useRouter = jest.fn(() => ({
  route: '/',
  pathname: '/',
  query: {},
  asPath: '/',
  push: jest.fn(),
  replace: jest.fn(),
  reload: jest.fn(),
  back: jest.fn(),
  prefetch: jest.fn().mockResolvedValue(undefined), // Updated to mockResolvedValue
  beforePopState: jest.fn(),
  events: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  },
  isFallback: false,
  isLocaleDomain: false,
  isReady: true,
  basePath: '',
  isPreview: false,
}));

// Export other potentially used router functionalities if needed
export const withRouter = (Component) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Component.defaultProps = {
    ...(Component.defaultProps || {}),
    router: useRouter(),
  };
  return Component;
};

// Mock specific router parts if necessary, e.g. for `usePathname` from `next/navigation`
export const usePathname = jest.fn(() => '/');
export const useSearchParams = jest.fn(() => new URLSearchParams());
// Add any other exports from next/router you use
export default { useRouter };

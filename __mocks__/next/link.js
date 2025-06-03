import React from 'react';
import { jest } from '@jest/globals'; // Ensure jest is imported if not globally available

// Mocking next/link
// Source: https://github.com/vercel/next.js/blob/canary/docs/guides/writing-tests.md#mocking-nextlink
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Link = ({ children, href, replace, scroll, shallow, passHref, ...rest }) => {
  const child = React.Children.only(children);

  // If the child is an <a> tag, pass props through.
  // This handles cases like <Link href="/foo"><a>Bar</a></Link>
  if (child && child.type === 'a') {
    return React.cloneElement(child, { href, ...rest });
  }

  // If the child is not an <a> tag, wrap it in one.
  // This handles cases like <Link href="/foo">Bar</Link>
  return (
    <a href={href} {...rest}>
      {children}
    </a>
  );
};

export default Link;

// If you're also using next/navigation's Link, you might need to mock that too,
// or ensure your tests specifically import from 'next/link'.
// For this example, we are focusing on the 'next/link' import.
// export const navigationLinkMock = jest.fn().mockImplementation(({ href, children, ...rest }) => (
//   <a href={href} {...rest}>{children}</a>
// ));
// jest.mock('next/navigation', () => ({
//   ...jest.requireActual('next/navigation'),
//   Link: navigationLinkMock,
//   useRouter: () => require('./router').useRouter(), // reuse the router mock
//   usePathname: () => require('./router').usePathname(),
//   useSearchParams: () => require('./router').useSearchParams(),
// }));

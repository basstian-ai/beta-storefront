import React from 'react';
import { jest } from '@jest/globals'; // Ensure jest is imported

// Mocking next/image
// Source: https://github.com/vercel/next.js/blob/canary/docs/guides/writing-tests.md#mocking-nextimage
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Image = ({ src, alt, ...props }) => {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} {...props} />;
};

export default Image;

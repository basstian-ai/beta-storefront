// next.config.js
const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Allow production builds to succeed even if there are type errors.
    // REMOVE once the project compiles clean.
    ignoreBuildErrors: true,
  },
  webpack(config) {
    config.resolve.alias['@'] = path.join(__dirname, 'src');
    return config;
  },
  images: { // Add this section for external image domains
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.dummyjson.com',
        // port: '', // if needed
        // pathname: '/image/upload/**', // if specific path needed
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  env: {
    NEXT_PUBLIC_API_BASE_URL:
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      process.env.DUMMYJSON_API_BASE ||
      'https://dummyjson.com',
  },
};

module.exports = nextConfig;

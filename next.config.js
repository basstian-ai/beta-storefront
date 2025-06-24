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
  images: {
    domains: ['i.dummyjson.com', 'dummyjson.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.dummyjson.com',
      },
      {
        protocol: 'https',
        hostname: 'robohash.org',
      },
    ],
  },
};

module.exports = nextConfig;

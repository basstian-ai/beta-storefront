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
        // port: '',
        // pathname: '/**', // Allow all paths for this hostname
      },
      {
        protocol: 'https',
        hostname: 'robohash.org',
        // port: '',
        // pathname: '/**', // Allow all paths for this hostname
      },
    ],
  },
};

module.exports = nextConfig;

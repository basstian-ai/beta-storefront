import type { NextConfig } from "next";
import path from 'path'; // Import path

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Add alias for @/*
    // The 'as any' is used here because the `resolve.alias` type might not strictly match
    // what we're assigning, but this is a common pattern for this configuration.
    (config.resolve.alias as any)['@'] = path.join(__dirname, 'src');

    // Important: return the modified config
    return config;
  },
};

export default nextConfig;

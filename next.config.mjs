import path from 'path';
import { fileURLToPath } from 'url';

// Required to define __dirname in ESM (next.config.mjs)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  webpack: (config) => {
    config.resolve.alias['@'] = path.resolve(__dirname); // 👈 This sets @ to root
    return config;
  },
};

export default nextConfig;

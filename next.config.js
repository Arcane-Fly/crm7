/** @type {import('next').NextConfig} */
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nextConfig = {
  images: {
    domains: ['avatars.githubusercontent.com', 'lh3.googleusercontent.com'],
  },
  experimental: {
    externalDir: true,
  },
  eslint: {
    dirs: ['app', 'components', 'lib', 'types', 'utils'],
  },
  webpack: (config) => {
    config.resolve.alias['@/hooks'] = path.join(__dirname, 'hooks');
    return config;
  },
};

export default nextConfig;

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
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  },
  eslint: {
    ignoreDuringBuilds: true,
    dirs: ['app', 'components', 'lib', 'types', 'utils'],
  },
  webpack: (config, { isServer }) => {
    config.resolve.alias['@/hooks'] = path.join(__dirname, 'hooks');
    // Suppress punycode warning
    config.ignoreWarnings = [
      { module: /node_modules\/punycode/ }
    ];
    return config;
  },
};

export default nextConfig;

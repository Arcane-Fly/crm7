/** @type {import('next').NextConfig} */
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
};

export default nextConfig;

const path = require('path');

// Add alias for '@/hooks'
if (!module.exports.webpack) {
  module.exports.webpack = (config) => {
    config.resolve.alias['@/hooks'] = path.join(__dirname, 'hooks');
    return config;
  };
} else {
  const originalWebpack = module.exports.webpack;
  module.exports.webpack = (config, options) => {
    config.resolve.alias['@/hooks'] = path.join(__dirname, 'hooks');
    return originalWebpack(config, options);
  };
}

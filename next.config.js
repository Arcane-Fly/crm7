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

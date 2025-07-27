/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    reactCompiler: true,
  },
  transpilePackages: ['@data-table/filters'],
};

module.exports = nextConfig;
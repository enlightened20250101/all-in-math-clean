/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: { bodySizeLimit: '2mb' },
  },
  turbopack: {
    root: __dirname,
  },
  // mathlive をビルドに巻き込む
  transpilePackages: ['mathlive'],
};

module.exports = nextConfig; // ← ここを CommonJS に

/** @type {import('next').NextConfig} */
const path = require('path');
const nextConfig = {
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  output: 'standalone',
  outputFileTracingRoot: path.resolve(__dirname, '..', '..'),
  // Next.js 15 uses the App Router by default; remove deprecated flag
  images: {
    formats: ['image/avif', 'image/webp'],
    // Add domains if you need to load images from external sources
    // domains: ['your-image-source.com'],
  },
};

module.exports = nextConfig;

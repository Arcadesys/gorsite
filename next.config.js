/** @type {import('next').NextConfig} */
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
  experimental: {
    // This will disable static generation for client components
    // which is causing issues with ThemeContext
    appDir: true,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    // Add domains if you need to load images from external sources
    // domains: ['your-image-source.com'],
  },
};

module.exports = nextConfig; 
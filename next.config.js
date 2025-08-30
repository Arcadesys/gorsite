/** @type {import('next').NextConfig} */
// Removed manual outputFileTracingRoot to let Next/Vercel handle tracing correctly
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
  // 'standalone' is fine locally or in containers; Vercel will ignore it.
  output: 'standalone',
  // Next.js 15 uses the App Router by default; remove deprecated flag
  images: {
    formats: ['image/avif', 'image/webp'],
    // Add domains if you need to load images from external sources
    // domains: ['your-image-source.com'],
  },
};

module.exports = nextConfig;

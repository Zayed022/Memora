/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['img.clerk.com', 'memora-uploads.s3.amazonaws.com'],
  },
  experimental: {
    serverActions: { bodySizeLimit: '10mb' },
  },
  // Prevent Next.js from trying to statically analyse API routes at build time
  output: 'standalone',
}

module.exports = nextConfig
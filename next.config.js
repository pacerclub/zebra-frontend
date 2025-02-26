/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable SWC minification to avoid platform-specific issues
  swcMinify: false,
  
  // Configure webpack to handle platform differences
  webpack: (config, { isServer }) => {
    // Add any necessary webpack configurations
    return config;
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1',
  },

  // API route rewrites
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;

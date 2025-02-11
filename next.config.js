/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable SWC minification to avoid platform-specific issues
  swcMinify: false,
  
  // Configure webpack to handle platform differences
  webpack: (config, { isServer }) => {
    // Add any necessary webpack configurations
    return config;
  },
};

module.exports = nextConfig;

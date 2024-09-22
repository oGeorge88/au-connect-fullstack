/** @type {import('next').NextConfig} */

const nextConfig = {
  // Rewrites for proxying API requests
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`, // Proxy to API
      },
    ];
  },

  // Enable instrumentation hook for performance tracking
  experimental: {
    instrumentationHook: true,
  },

  // Optionally enable React Strict Mode and SWC minification
  reactStrictMode: true, // Helps detect potential issues in development
  swcMinify: true,       // Faster build times with SWC minification

  // Ensure API URL is set (optional validation)
  publicRuntimeConfig: {
    apiUrl: process.env.NEXT_PUBLIC_API_URL,
  },
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    // Use server-side environment variable, not NEXT_PUBLIC_ prefixed one
    const apiUrl = process.env.API_URL || 'http://localhost:3000/api';  // Fallback to local API if undefined
    if (!process.env.API_URL) {
        console.warn('API_URL is not defined. Falling back to localhost.');
    }
    console.log("API_URL:", apiUrl); // Log API URL for debugging

    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/:path*`,  // Use API_URL in rewrites
      },
    ];
  },
  // Other configurations (if needed)
};

export default nextConfig;

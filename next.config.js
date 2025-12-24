/**
 * Next.js Configuration
 * Configured for Webflow Cloud deployment
 * Using ES module syntax (project has "type": "module" in package.json)
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure base path and asset prefix to match Webflow Cloud mount path
  // When creating your Webflow Cloud environment, set a mount path (e.g., /api)
  // Then update these values to match, or set NEXT_PUBLIC_BASE_PATH environment variable
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH || '',
  
  // API routes configuration
  async headers() {
    return [
      {
        // Apply CORS headers to API routes
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*', // In production, consider restricting to specific Webflow domains
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'POST, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type',
          },
        ],
      },
    ];
  },
  
  // Environment variables that should be available on the client
  // Note: WEBFLOW_API_TOKEN should NOT be exposed to client
  env: {
    // Add any public environment variables here if needed
  },
};

export default nextConfig;


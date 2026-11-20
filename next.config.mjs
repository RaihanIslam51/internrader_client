/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimize images from any source
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Ensure environment variable is exposed to client with solid fallback
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://metaadsserver.vercel.app/api',
  },
};


export default nextConfig;

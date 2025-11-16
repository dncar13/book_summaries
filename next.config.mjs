/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    typedRoutes: true,
    serverActions: {
      allowedOrigins: [process.env.NEXT_PUBLIC_SUPABASE_URL || '']
    }
  }
};

export default nextConfig;

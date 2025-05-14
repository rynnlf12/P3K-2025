/** @type {import('next').NextConfig} */

module.exports = {
  images: {
    domains: ['llvesnxqpifjjrcecnxj.supabase.co'], // Ganti dengan URL Supabase Anda
  },
};
const nextConfig = {
  experimental: {
    turbo: {
      enabled: true, // Fix for turbo experimental setting
    },
  },
   images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'llvesnxqpifjjrcecnxj.supabase.co', // ganti sesuai domain gambarmu
        port: '',
        pathname: '/**',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
};

module.exports = nextConfig;

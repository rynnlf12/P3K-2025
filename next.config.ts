/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: true,
  },
  output: "export", // Ini WAJIB untuk next export agar build ke HTML statis
};

module.exports = nextConfig;

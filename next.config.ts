import path from 'path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  webpack: (config) => {
    // Path alias
    config.resolve.alias['@'] = path.resolve(__dirname, 'src');
    
    // Worker loader configuration
    config.module.rules.push({
      test: /\.worker\.js$/,
      use: {
        loader: 'worker-loader',
        options: {
          publicPath: '/_next/',
          inline: 'no-fallback' // <-- Diubah ke string
        }
      }
    });

    return config;
  },
};

export default nextConfig;
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'prisma']
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ]
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': '.',
      '@/lib': './lib',
      '@/app': './app',
      '@/app/utils': './app/utils'
    }
    config.resolve.fallback = {
      ...config.resolve.fallback,
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      util: require.resolve('util/'),
      vm: false,
      fs: false,
      net: false,
      tls: false
    }
    return config
  },
}

module.exports = nextConfig 
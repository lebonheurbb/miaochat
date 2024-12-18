/** @type {import('next').NextConfig} */
const nextConfig = {
  // 输出模式
  output: 'standalone',
  
  // 实验性功能
  experimental: {
    appDir: true,
  },
  
  // 图片配置
  images: {
    domains: ['vercel.app'],
    unoptimized: true,
  },
  
  // 环境变量
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001',
  },

  // 构建配置
  reactStrictMode: true,
  swcMinify: true,
}

module.exports = nextConfig 
/** @type {import('next').NextConfig} */
const nextConfig = {
  // 静态导出配置
  output: 'export',
  
  // 禁用图片优化
  images: {
    unoptimized: true,
  },
  
  // 基础路径配置
  basePath: '',
  
  // 关闭严格模式便于调试
  reactStrictMode: false,
  
  // 禁用 webpack 5 的 appDir 功能
  experimental: {
    appDir: false,
  },
}

module.exports = nextConfig
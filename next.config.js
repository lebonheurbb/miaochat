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
  
  // 启用环境变量
  env: {
    NEXT_PUBLIC_GEMINI_API_KEY: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
  }
}

module.exports = nextConfig
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js 16 默认使用 Turbopack (开发模式)
  // 如需使用 webpack，运行: npm run dev:webpack 或 npm run build:webpack
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
  
  // 确保构建稳定性
  reactStrictMode: true,
  
  // TypeScript和ESLint配置
  typescript: {
    // 生产构建时如果有类型错误，会失败（推荐）
    ignoreBuildErrors: false,
  },
  eslint: {
    // 生产构建时如果有ESLint错误，会失败（推荐）
    ignoreDuringBuilds: false,
  },
}

module.exports = nextConfig

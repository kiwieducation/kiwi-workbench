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
  
  // TypeScript配置
  typescript: {
    // 生产构建时如果有类型错误，会失败（推荐）
    ignoreBuildErrors: false,
  },
  // ESLint: Next.js 16 不再支持 eslint 配置键，请使用 npm run lint 单独检查
}

module.exports = nextConfig

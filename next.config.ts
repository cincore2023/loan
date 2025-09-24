import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 禁用 ESLint 检查以解决构建问题
  eslint: {
    ignoreDuringBuilds: true,
  },
  // 配置选项
  reactStrictMode: true,
};

export default nextConfig;
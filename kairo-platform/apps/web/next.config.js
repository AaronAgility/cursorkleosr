/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@ai-sdk/anthropic', '@ai-sdk/google', '@ai-sdk/openai'],
  transpilePackages: ["@repo/ui"],
};

module.exports = nextConfig;

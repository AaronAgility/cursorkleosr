/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@ai-sdk/anthropic', '@ai-sdk/google', '@ai-sdk/openai'],
  transpilePackages: ["@repo/ui"],
  experimental: {
    esmExternals: true,
  },
  // Disable static optimization for pages using client-side hooks
  output: 'standalone',
  // Add runtime configuration
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;

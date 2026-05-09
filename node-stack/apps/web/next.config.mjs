/** @type {import('next').NextConfig} */
const nextConfig = {
  // ESLint is enforced by pnpm lint (turbo pipeline); disable during next build
  // to avoid double-linting and to prevent import/order build failures.
  eslint: { ignoreDuringBuilds: true },
  transpilePackages: ["@node-stack/ui"],
  webpack: (config) => {
    config.resolve.extensionAlias = {
      ".js": [".js", ".ts", ".tsx"],
    };
    return config;
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:4000/v1/:path*",
      },
    ];
  },
};

export default nextConfig;

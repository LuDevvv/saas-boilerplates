/** @type {import('next').NextConfig} */
const nextConfig = {
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

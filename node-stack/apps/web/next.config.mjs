/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@node-stack/ui"],
  webpack: (config) => {
    config.resolve.extensionAlias = {
      ".js": [".js", ".ts", ".tsx"],
    };
    return config;
  },
};

export default nextConfig;

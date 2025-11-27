/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: "/chat",
  assetPrefix: "/chat",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

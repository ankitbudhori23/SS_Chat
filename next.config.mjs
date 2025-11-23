/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  trailingSlash: true,
  experimental: {
    fallbackNodePolyfills: false,
  },
};

export default nextConfig;

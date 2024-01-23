/** @type {import('next').NextConfig} */

const withPWA = require("next-pwa");

const config = {
  reactStrictMode: false,
  experimental: {
    scrollRestoration: true,
  },
  async rewrites() {
    return [
      {
        source: "/api/univs/documents/:slug",
        destination: `https://dshs.site/api/document/:slug/1`
      },
      {
        source: "/api/univs/questions/:slug",
        destination: `https://dshs.site/api/docsample/:slug`
      }
    ]
  }
}

const nextConfig = withPWA({
  dest: "public",
  runtimeCaching: [],
})(config);

module.exports = nextConfig

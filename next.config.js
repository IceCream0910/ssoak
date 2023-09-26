/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
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

module.exports = nextConfig

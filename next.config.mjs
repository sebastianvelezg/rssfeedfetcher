// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/api/cron/update-feeds",
        destination: "/api/update-feeds",
      },
    ];
  },
};

export default nextConfig;

require("dotenv").config({ path: ".env.local" });

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    SHOPIFY_ADMIN_API_TOKEN: process.env.SHOPIFY_ADMIN_API_TOKEN,
    SHOPIFY_STORE_DOMAIN: process.env.SHOPIFY_STORE_DOMAIN,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
        pathname: "/s/files/**",
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com", // Adicionando pra permitir o fallback
        pathname: "/**",
      },
    ],
  },
};

module.exports = nextConfig;
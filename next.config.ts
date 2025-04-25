require("dotenv").config({ path: ".env.local" });

module.exports = {
  env: {
    SHOPIFY_ADMIN_API_TOKEN: process.env.SHOPIFY_ADMIN_API_TOKEN,
    SHOPIFY_STORE_DOMAIN: process.env.SHOPIFY_STORE_DOMAIN,
  },
};
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
        pathname: "/s/files/**",
      },
    ],
  },
};

module.exports = nextConfig;
import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";

const withPwaConfig = withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  serverExternalPackages: ['pdf-parse', 'tesseract.js'],
  turbopack: {},
};

export default withPwaConfig(nextConfig);

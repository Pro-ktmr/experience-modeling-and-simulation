import type { NextConfig } from "next";

const IS_DEV = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  output: "export",
  images: {
    unoptimized: true,
  },
  basePath: IS_DEV ? "" : "/experience-modeling-and-simulation",
};

export default nextConfig;

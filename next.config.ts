import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  experimental: {
    turbo: {
      enabled: false,  // force webpack
    },
  },
  /* config options here */
};

export default nextConfig;

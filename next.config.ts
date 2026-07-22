import type { NextConfig } from "next";
import path from "path";

// Fuerza el root del proyecto. Sin esto, Turbopack puede tomar
// /Users/casu/package-lock.json y romper el React Client Manifest.
const projectRoot = path.resolve(__dirname);

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
  },
  outputFileTracingRoot: projectRoot,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
  },
};

export default nextConfig;

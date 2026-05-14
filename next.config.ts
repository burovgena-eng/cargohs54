import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  experimental: {
    cpus: 1,
    workerThreads: false,
    memoryUsageWorkers: 1,
  },
};

export default nextConfig;

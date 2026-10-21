import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Supports an isolated production build without colliding with a running dev server.
  distDir: process.env.NEXT_DIST_DIR?.trim() || ".next",
  experimental: {
    agentFeedback: true,
    // Product forms submit image/video files through Server Actions.
    // Keep this slightly above the combined 5 MB image + 25 MB video limits.
    serverActions: {
      bodySizeLimit: "32mb",
    },
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

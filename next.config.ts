import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A second dev server (the review walks on :3001) needs its own build folder: NEXT_DIST_DIR=.next-test.
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  // Every page reads the DB at request time; classic dynamic rendering is simpler than cacheComponents here.
  cacheComponents: false,
  serverExternalPackages: ["pg"],
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

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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

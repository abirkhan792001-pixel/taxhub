import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: { root: process.cwd() },
  // the corpus is read from disk at runtime; make sure it ships with the functions
  outputFileTracingIncludes: {
    "/api/*": ["./data/corpus.json"],
    "/*": ["./data/corpus.json", "./knowledge/*.md"],
  },
  // landing page photography (Unsplash License)
  images: {
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
};

export default nextConfig;

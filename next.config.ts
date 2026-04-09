import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Repo has multiple lockfiles; pin root to this app folder.
    root: __dirname,
  },
};

export default nextConfig;

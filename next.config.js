/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  experimental: {
    nodeMiddleware: true,
    reactCompiler: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: process.env.MINIO_ENDPOINT || "localhost",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: process.env.MINIO_ENDPOINT || "localhost",
        pathname: "/**",
      },
    ],
  },
};

export default config;

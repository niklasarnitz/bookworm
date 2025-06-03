/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";
import { withSentryConfig } from "@sentry/nextjs";

/** @type {import("next").NextConfig} */
const config = withSentryConfig({
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
}, {
  org: "bookworm",
  project: "bookworm-web",
  sentryUrl: "https://glitchtip.app.niklas.services/",
  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,
  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,
  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/api/tunnel",
  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,
  automaticVercelMonitors: false,
});

export default config;

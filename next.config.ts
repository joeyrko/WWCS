import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  /* config options here */
};

export default withSentryConfig(nextConfig, {
  org: "world-wrestling-council-inc",
  project: "javascript-nextjs",
  // Source maps are only uploaded when SENTRY_AUTH_TOKEN is set (production
  // builds on Hostinger) — a build without it just skips the upload instead
  // of failing, same pattern as the other optional integrations (Resend,
  // Google OAuth) in this codebase.
  silent: !process.env.CI,
  widenClientFileUpload: true,
});

import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  // geoip-lite locates its bundled MaxMind .dat files via a path relative to
  // its own __dirname at actual lookup time — Turbopack's server bundling
  // rewrites that to a virtual path with no real files behind it (ENOENT),
  // both during the build's page-data-collection step and at request time.
  // This opts it out of bundling entirely so Next uses a plain native
  // require(), preserving its real on-disk __dirname.
  serverExternalPackages: ["geoip-lite"],
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

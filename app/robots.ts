import type { MetadataRoute } from "next";
import { getBaseUrl } from "@/lib/stripe";

// Most of the site sits behind the sign-in gate in proxy.ts, so there's
// nothing for a crawler to index there — point it at the public
// marketing/auth pages instead and keep it off gated/API routes.
export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl();

  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/sign-in", "/sign-up"],
      disallow: ["/api/", "/admin", "/account", "/pricing", "/events", "/watch"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

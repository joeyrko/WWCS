import type { MetadataRoute } from "next";
import { getBaseUrl } from "@/lib/stripe";

// Only the public marketing/auth pages are listed — everything else sits
// behind the sign-in gate in proxy.ts and isn't reachable by a crawler.
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getBaseUrl();

  return [
    { url: baseUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/sign-in`, changeFrequency: "yearly", priority: 0.5 },
    { url: `${baseUrl}/sign-up`, changeFrequency: "yearly", priority: 0.8 },
    { url: `${baseUrl}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/terms`, changeFrequency: "yearly", priority: 0.3 },
  ];
}

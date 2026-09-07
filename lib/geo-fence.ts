import geoip from "geoip-lite";
import type { Video } from "@/types";

// MaxMind's GeoLite2 data (bundled via geoip-lite) assigns Puerto Rico its
// own ISO 3166-1 country code, "PR" — distinct from "US" — so a plain
// country-code check is all that's needed, no US-state/region logic.
//
// Caveat: the data shipped with geoip-lite is a snapshot from whenever that
// npm version was published, not live-updated. Spot-checking it against
// verified Puerto Rico IP ranges (RIPEstat's country-resource list) showed
// ~60% of ranges correctly resolving to "PR", with the rest either missing
// (null) or resolving to a stale country. For production accuracy this
// needs `node node_modules/geoip-lite/scripts/updatedb.js
// license_key=YOUR_KEY` run periodically with a free MaxMind account — see
// https://www.maxmind.com/en/geolite2/signup. Until then, this is a
// best-effort geofence, not a guarantee.
export function isPuertoRicoIp(ip: string | null): boolean {
  if (!ip) return false;
  const geo = geoip.lookup(ip);
  return geo?.country === "PR";
}

// x-forwarded-for can carry a chain ("client, proxy1, proxy2") when a
// request passes through multiple hops — the first entry is the original
// client. Falls back to x-real-ip for hosts that set that instead.
export function getClientIp(headersList: Headers): string | null {
  const forwardedFor = headersList.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }
  return headersList.get("x-real-ip");
}

// Broadcast-rights blackout: only live events are restricted, and only for
// visitors resolving to Puerto Rico. Everything else (replays, PPV
// full-shows, highlights, etc.) is unaffected regardless of location.
export function isLiveEventBlackedOut(video: Video, headersList: Headers): boolean {
  if (video.showType !== "live-event") return false;
  return isPuertoRicoIp(getClientIp(headersList));
}

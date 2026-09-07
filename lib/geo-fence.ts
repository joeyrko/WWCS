import type { Video } from "@/types";

// Loaded lazily rather than a static top-level `import` — geoip-lite eagerly
// reads ~100MB of MaxMind data into memory the instant it's loaded, and
// Next's build-time page-data-collection step evaluates a route's top-level
// imports without ever calling the page itself, which broke `next build`
// entirely (ENOENT trying to read the data files under a virtualized
// build-analysis path, not the real one). Deferring the load into this
// function means it only runs at actual request time, and the module-level
// cache means it only loads once per server process, not per request.
// Node's ESM/CJS interop puts geoip-lite's actual exports (lookup, cmp,
// etc.) under `.default` on a dynamic import() — the module's static
// named-export analysis doesn't reliably pick them up at the top level, even
// though @types/geoip-lite's declaration (correctly, for the shape once
// unwrapped) describes them as plain named exports. Casting through
// `.default` here is what makes the runtime shape match that declared type.
let geoipModule: typeof import("geoip-lite") | undefined;
async function getGeoip() {
  if (!geoipModule) {
    const mod = await import("geoip-lite");
    geoipModule = (mod as unknown as { default: typeof import("geoip-lite") }).default;
  }
  return geoipModule;
}

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
export async function isPuertoRicoIp(ip: string | null): Promise<boolean> {
  if (!ip) return false;
  const geoip = await getGeoip();
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
export async function isLiveEventBlackedOut(video: Video, headersList: Headers): Promise<boolean> {
  if (video.showType !== "live-event") return false;
  return isPuertoRicoIp(getClientIp(headersList));
}

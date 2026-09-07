import { NextResponse } from "next/server";
import { isPuertoRicoIp, getClientIp } from "@/lib/geo-fence";

// Temporary diagnostic route — runs the real geo-fence check against a set
// of known/verified IPs plus the caller's own detected IP, directly on the
// live server. Delete once the production behavior is confirmed; not meant
// to be a permanent route.
const KNOWN_IPS: [string, string][] = [
  ["23.128.16.0", "verified PR (San Sebastian)"],
  ["23.136.112.0", "verified PR (Coamo)"],
  ["8.8.8.8", "Google DNS, US"],
  ["1.1.1.1", "Cloudflare, AU"],
];

export async function GET(request: Request) {
  const url = new URL(request.url);
  const queryIp = url.searchParams.get("ip");
  const detectedIp = getClientIp(request.headers);

  const results = KNOWN_IPS.map(([ip, label]) => ({
    ip,
    label,
    isPR: isPuertoRicoIp(ip),
  }));

  if (queryIp) {
    results.push({ ip: queryIp, label: "query param", isPR: isPuertoRicoIp(queryIp) });
  }

  return NextResponse.json({
    detectedIp,
    detectedIpIsPR: isPuertoRicoIp(detectedIp),
    results,
  });
}

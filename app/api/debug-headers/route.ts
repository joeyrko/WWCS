import { NextResponse } from "next/server";

// Temporary diagnostic route — echoes back the request headers the server
// actually sees, to confirm whether Hostinger's front-end sets
// x-forwarded-for at all (the geo-fence in lib/geo-fence.ts depends on it).
// Delete this once that's confirmed; it's not meant to be a permanent route.
export async function GET(request: Request) {
  const headers = Object.fromEntries(request.headers.entries());
  return NextResponse.json({ headers });
}

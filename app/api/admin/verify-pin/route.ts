import { NextResponse } from "next/server";
import { getSession } from "@/lib/get-session";
import { ADMIN_PIN_COOKIE, ADMIN_PIN_MAX_AGE_SECONDS, getAdminPin } from "@/lib/admin-pin";

// Second factor in front of /admin. Being an admin account alone isn't
// enough — this route also requires the shared PIN before it will set the
// cookie /admin checks for.
export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const pin = typeof body?.pin === "string" ? body.pin : "";

  if (pin !== getAdminPin()) {
    return NextResponse.json({ error: "Incorrect PIN." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_PIN_COOKIE, "verified", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: ADMIN_PIN_MAX_AGE_SECONDS,
    path: "/",
  });
  return response;
}

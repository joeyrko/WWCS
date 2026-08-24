import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSession } from "@/lib/get-session";
import { ADMIN_PIN_COOKIE } from "@/lib/admin-pin";
import { setFreeAccessUntil } from "@/lib/data/settings";

const FREE_ACCESS_DURATION_MS = 24 * 60 * 60 * 1000;

async function requireAdmin() {
  const session = await getSession();
  if (!session?.user?.isAdmin) return false;
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_PIN_COOKIE)?.value === "verified";
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const action = body?.action;

  if (action === "enable") {
    const until = new Date(Date.now() + FREE_ACCESS_DURATION_MS);
    await setFreeAccessUntil(until);
    return NextResponse.json({ freeAccessUntil: until.toISOString() });
  }

  if (action === "disable") {
    await setFreeAccessUntil(null);
    return NextResponse.json({ freeAccessUntil: null });
  }

  return NextResponse.json({ error: "Invalid action." }, { status: 400 });
}

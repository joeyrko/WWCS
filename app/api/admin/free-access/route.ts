import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-pin";
import { setFreeAccessUntil } from "@/lib/data/settings";

const FREE_ACCESS_DURATION_MS = 24 * 60 * 60 * 1000;

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

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-pin";
import { setGeoFenceDisabled } from "@/lib/data/settings";

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const action = body?.action;

  if (action === "enable") {
    await setGeoFenceDisabled(false);
    return NextResponse.json({ disabled: false });
  }

  if (action === "disable") {
    await setGeoFenceDisabled(true);
    return NextResponse.json({ disabled: true });
  }

  return NextResponse.json({ error: "Invalid action." }, { status: 400 });
}

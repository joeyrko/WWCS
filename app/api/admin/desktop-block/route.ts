import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-pin";
import { setDesktopBlock } from "@/lib/data/settings";

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const action = body?.action;

  if (action === "enable") {
    await setDesktopBlock(true);
    return NextResponse.json({ enabled: true });
  }

  if (action === "disable") {
    await setDesktopBlock(false);
    return NextResponse.json({ enabled: false });
  }

  return NextResponse.json({ error: "Invalid action." }, { status: 400 });
}

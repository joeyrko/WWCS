import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-pin";
import { deleteSponsor } from "@/lib/data/sponsors";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const { id } = await params;
  await deleteSponsor(id);
  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/get-session";
import { requireAdmin } from "@/lib/admin-pin";
import { adminUpdateUser, deleteUser } from "@/lib/data/users";

const updateUserSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  email: z.string().trim().email("Enter a valid email address."),
  plan: z.enum(["monthly", "annual", "legacy"]).nullable(),
  isAdmin: z.boolean(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = updateUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 }
    );
  }

  try {
    await adminUpdateUser(id, parsed.data);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unable to update account.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const { id } = await params;

  // Never let an admin delete their own account through this tool — the
  // easiest way to get permanently locked out of /admin.
  const session = await getSession();
  if (session?.user?.id === id) {
    return NextResponse.json({ error: "You can't delete your own account." }, { status: 400 });
  }

  await deleteUser(id);
  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-pin";
import { adminCreateUser } from "@/lib/data/users";

const createUserSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  plan: z.enum(["monthly", "annual", "legacy"]).nullable(),
  isAdmin: z.boolean(),
});

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 }
    );
  }

  try {
    const user = await adminCreateUser(parsed.data);
    return NextResponse.json({ id: user.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unable to create account.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

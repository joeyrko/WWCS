import { NextResponse } from "next/server";
import { z } from "zod";
import { createUser } from "@/lib/data/users";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 }
    );
  }

  try {
    const user = await createUser(parsed.data);
    return NextResponse.json({ id: user.id, email: user.email }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unable to create account.";
    return NextResponse.json({ error: message }, { status: 409 });
  }
}

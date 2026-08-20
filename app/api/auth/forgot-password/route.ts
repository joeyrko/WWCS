import { NextResponse } from "next/server";
import { z } from "zod";
import { createPasswordResetToken } from "@/lib/data/users";

const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address."),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = forgotPasswordSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 }
    );
  }

  const token = await createPasswordResetToken(parsed.data.email);
  if (!token) {
    return NextResponse.json({ error: "No account found with that email." }, { status: 404 });
  }

  return NextResponse.json({ resetUrl: `/reset-password?token=${token}` });
}

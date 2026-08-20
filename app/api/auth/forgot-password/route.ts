import { NextResponse } from "next/server";
import { z } from "zod";
import { createPasswordResetToken } from "@/lib/data/users";
import { emailIsConfigured, sendPasswordResetEmail } from "@/lib/email";

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

  const relativeUrl = `/reset-password?token=${token}`;

  if (!emailIsConfigured()) {
    // No email provider configured (e.g. local dev) — hand the link straight
    // back so the UI can show it directly instead of pretending to send it.
    return NextResponse.json({ resetUrl: relativeUrl });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;

  try {
    await sendPasswordResetEmail(parsed.data.email, new URL(relativeUrl, appUrl).toString());
  } catch (err) {
    // Delivery failed (e.g. Resend domain not verified yet) — the token is
    // still valid, so fall back to showing the link directly rather than
    // leaving the user with no way to actually reset their password.
    console.error("Failed to send password reset email:", err);
    return NextResponse.json({ resetUrl: relativeUrl });
  }

  return NextResponse.json({ emailSent: true });
}

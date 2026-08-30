import { Resend } from "resend";

// Only wired up when RESEND_API_KEY is configured — callers should fall back
// to their own demo behavior (e.g. showing the link directly) when this
// returns false, same pattern as the conditional Google OAuth provider.
export function emailIsConfigured(): boolean {
  return !!process.env.RESEND_API_KEY;
}

const FROM_ADDRESS = process.env.RESEND_FROM_EMAIL || "WWC+ <onboarding@resend.dev>";

export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
  const resend = new Resend(process.env.RESEND_API_KEY);

  // The SDK returns { data, error } instead of throwing for API-level
  // failures (e.g. unverified domain, restricted recipient in test mode) —
  // an unchecked `error` here would silently report success on a send that
  // never actually went out.
  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: "Reset your WWC+ password",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h1 style="font-size: 20px;">Reset your password</h1>
        <p>We received a request to reset the password on your WWC+ account. This link expires in 30 minutes.</p>
        <p>
          <a href="${resetUrl}" style="display: inline-block; background: #0038f0; color: #fff; padding: 12px 20px; border-radius: 4px; text-decoration: none; font-weight: bold;">
            Reset Password
          </a>
        </p>
        <p>If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });

  if (error) {
    throw new Error(error.message ?? "Resend rejected the email.");
  }
}

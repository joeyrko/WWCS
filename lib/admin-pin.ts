import { cookies } from "next/headers";
import { getSession } from "@/lib/get-session";

export const ADMIN_PIN_COOKIE = "wwc_admin_pin";
export const ADMIN_PIN_MAX_AGE_SECONDS = 60 * 60; // 1 hour

// Falls back to a fixed default so the gate works out of the box for this
// demo/scaffold without extra setup — set ADMIN_PIN in the environment to
// override it for a real deployment instead of relying on the source default.
export function getAdminPin(): string {
  return process.env.ADMIN_PIN ?? "062714";
}

// Shared by every /api/admin/* route — being an admin account alone isn't
// enough, the PIN-verified cookie (set by /api/admin/verify-pin, same gate
// the /admin page itself sits behind) is required too.
export async function requireAdmin(): Promise<boolean> {
  const session = await getSession();
  if (!session?.user?.isAdmin) return false;
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_PIN_COOKIE)?.value === "verified";
}

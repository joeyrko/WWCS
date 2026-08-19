export const ADMIN_PIN_COOKIE = "wwc_admin_pin";
export const ADMIN_PIN_MAX_AGE_SECONDS = 60 * 60; // 1 hour

// Falls back to a fixed default so the gate works out of the box for this
// demo/scaffold without extra setup — set ADMIN_PIN in the environment to
// override it for a real deployment instead of relying on the source default.
export function getAdminPin(): string {
  return process.env.ADMIN_PIN ?? "062714";
}

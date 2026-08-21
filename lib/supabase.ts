import { createClient } from "@supabase/supabase-js";

// Server-only client using the service_role key, which bypasses Row Level
// Security. Every table in the public schema has RLS enabled with no
// policies, so this is intentionally the only way in — never import this
// from a client component, and never expose SUPABASE_SERVICE_ROLE_KEY to
// the browser (unlike NEXT_PUBLIC_SUPABASE_URL, it has no NEXT_PUBLIC_ prefix).
// Placeholder fallbacks (matching lib/stripe.ts's pattern) so the module can
// still load — and the build can still run — before real credentials are
// set; calls just fail at request time instead of crashing on import.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-service-role-key",
  { auth: { persistSession: false } }
);

import { supabase } from "@/lib/supabase";

const FREE_ACCESS_UNTIL_KEY = "free_access_until";

// The free-access promo only ever unlocks this one video (the current Live
// Event) — everything else stays behind its normal access level. Shared here
// so the video-level access check (lib/data/users.ts) and the site-wide
// route guard (proxy.ts) both scope the bypass to the exact same video.
export const FREE_ACCESS_PROMO_SLUG = "terremoto-founding-territory-match-1973";

// Everything behind the paywall is free while this timestamp is in the
// future. Storing the expiry (rather than a plain on/off flag) is what lets
// it revert on its own — every access check just compares against "now",
// so nothing needs to run later to turn it back off.
export async function getFreeAccessUntil(): Promise<Date | null> {
  const { data } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", FREE_ACCESS_UNTIL_KEY)
    .maybeSingle();
  if (!data?.value) return null;
  const until = new Date(data.value);
  return Number.isNaN(until.getTime()) ? null : until;
}

export async function isFreeAccessActive(): Promise<boolean> {
  const until = await getFreeAccessUntil();
  return until !== null && until.getTime() > Date.now();
}

export async function setFreeAccessUntil(until: Date | null): Promise<void> {
  if (until === null) {
    await supabase.from("app_settings").delete().eq("key", FREE_ACCESS_UNTIL_KEY);
    return;
  }
  await supabase
    .from("app_settings")
    .upsert({ key: FREE_ACCESS_UNTIL_KEY, value: until.toISOString(), updated_at: new Date().toISOString() });
}

const MAINTENANCE_MODE_KEY = "maintenance_mode";

// Site-wide lock — blocks every visitor except an already-signed-in admin,
// used while content is still being uploaded / the app isn't ready for real
// customers yet. Unlike the free-access promo, this has no auto-expiry: it
// stays on until manually turned off from /admin.
export async function isMaintenanceModeActive(): Promise<boolean> {
  const { data } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", MAINTENANCE_MODE_KEY)
    .maybeSingle();
  return data?.value === "true";
}

export async function setMaintenanceMode(enabled: boolean): Promise<void> {
  if (!enabled) {
    await supabase.from("app_settings").delete().eq("key", MAINTENANCE_MODE_KEY);
    return;
  }
  await supabase
    .from("app_settings")
    .upsert({ key: MAINTENANCE_MODE_KEY, value: "true", updated_at: new Date().toISOString() });
}

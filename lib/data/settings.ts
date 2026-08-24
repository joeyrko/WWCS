import { supabase } from "@/lib/supabase";

const FREE_ACCESS_UNTIL_KEY = "free_access_until";

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

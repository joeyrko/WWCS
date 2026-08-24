import bcrypt from "bcryptjs";
import crypto from "crypto";
import { supabase } from "@/lib/supabase";
import { plans } from "@/data/plans";
import type { MockUser, Order, PlanId, Video } from "@/types";

// Repository layer over Supabase Postgres (see lib/supabase.ts). Every read
// and write here goes through the service_role key server-side — RLS on
// these tables has no policies, so this is the only way in.

interface UserRow {
  id: string;
  name: string;
  email: string;
  password_hash: string | null;
  image: string | null;
  plan: PlanId | null;
  plan_expires_at: string | null;
  purchased_event_slugs: string[];
  is_admin: boolean;
}

// A plan past its expiration has effectively lapsed even though the row
// still records what it was — this is what actually blocks access once a
// subscription isn't renewed, without needing every caller to know about
// plan_expires_at.
function toMockUser(row: UserRow): MockUser {
  const active = row.plan && (!row.plan_expires_at || new Date(row.plan_expires_at) > new Date());
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash ?? undefined,
    image: row.image ?? undefined,
    plan: active ? row.plan : null,
    purchasedEventSlugs: row.purchased_event_slugs,
    isAdmin: row.is_admin,
  };
}

export async function findUserByEmail(email: string): Promise<MockUser | undefined> {
  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("email", email.toLowerCase())
    .maybeSingle();
  return data ? toMockUser(data) : undefined;
}

export async function findUserById(id: string): Promise<MockUser | undefined> {
  const { data } = await supabase.from("users").select("*").eq("id", id).maybeSingle();
  return data ? toMockUser(data) : undefined;
}

// Used by the Stripe webhook to resolve which user a subscription/invoice
// event belongs to — events carry a Stripe customer id, not our user id.
export async function findUserByStripeCustomerId(customerId: string): Promise<MockUser | undefined> {
  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();
  return data ? toMockUser(data) : undefined;
}

export async function verifyPassword(user: MockUser, password: string): Promise<boolean> {
  if (!user.passwordHash) return false;
  return bcrypt.compare(password, user.passwordHash);
}

export async function createUser(input: {
  name: string;
  email: string;
  password: string;
}): Promise<MockUser> {
  const existing = await findUserByEmail(input.email);
  if (existing) {
    throw new Error("An account with that email already exists.");
  }
  const { data, error } = await supabase
    .from("users")
    .insert({
      name: input.name,
      email: input.email.toLowerCase(),
      password_hash: bcrypt.hashSync(input.password, 10),
    })
    .select("*")
    .single();
  if (error || !data) throw new Error("Unable to create account.");
  return toMockUser(data);
}

export async function findOrCreateOAuthUser(input: {
  name: string;
  email: string;
  image?: string;
}): Promise<MockUser> {
  const existing = await findUserByEmail(input.email);
  if (existing) return existing;
  const { data, error } = await supabase
    .from("users")
    .insert({ name: input.name, email: input.email.toLowerCase(), image: input.image })
    .select("*")
    .single();
  if (error || !data) throw new Error("Unable to create account.");
  return toMockUser(data);
}

// A monthly plan lapses in a month, everything else in a year — matches
// data/plans.ts's own interval field for each plan.
function planExpiryFromNow(planId: PlanId): string {
  const plan = plans.find((p) => p.id === planId);
  const expires = new Date();
  if (plan?.interval === "month") {
    expires.setMonth(expires.getMonth() + 1);
  } else {
    expires.setFullYear(expires.getFullYear() + 1);
  }
  return expires.toISOString();
}

// Sets the plan and (re)starts its expiration window from today. Called on
// initial checkout, on each successful renewal invoice, and when a
// subscription's price changes (upgrade/downgrade via the billing portal).
// stripeCustomerId is only passed on initial checkout, since that's the only
// place it's newly learned — later calls omit it and leave the stored value
// alone.
export async function updateUserPlan(
  userId: string,
  plan: PlanId,
  stripeCustomerId?: string
): Promise<void> {
  await supabase
    .from("users")
    .update({
      plan,
      plan_expires_at: planExpiryFromNow(plan),
      ...(stripeCustomerId ? { stripe_customer_id: stripeCustomerId } : {}),
    })
    .eq("id", userId);
}

// Called when a subscription is fully canceled (customer.subscription.deleted)
// — the stripe_customer_id stays on the row so re-subscribing later reuses
// the same Stripe Customer instead of creating a duplicate.
export async function clearUserPlan(userId: string): Promise<void> {
  await supabase.from("users").update({ plan: null, plan_expires_at: null }).eq("id", userId);
}

// Looked up by the billing portal route to send a subscriber to their real
// Stripe-hosted portal session — null means they've never completed a
// checkout (e.g. plan was granted some other way), not that something broke.
export async function getStripeCustomerId(userId: string): Promise<string | null> {
  const { data } = await supabase
    .from("users")
    .select("stripe_customer_id")
    .eq("id", userId)
    .maybeSingle();
  return data?.stripe_customer_id ?? null;
}

// Reset tokens are single-use and short-lived, so only a hash is persisted —
// same principle as a password, just cheaper since it's already random and
// doesn't need bcrypt's per-hash salt cost.
const RESET_TOKEN_TTL_MS = 30 * 60 * 1000;

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function createPasswordResetToken(email: string): Promise<string | null> {
  const user = await findUserByEmail(email);
  if (!user) return null;
  const token = crypto.randomUUID();
  await supabase.from("password_reset_tokens").insert({
    token_hash: hashToken(token),
    user_id: user.id,
    expires_at: new Date(Date.now() + RESET_TOKEN_TTL_MS).toISOString(),
  });
  return token;
}

export async function resetPasswordWithToken(token: string, newPassword: string): Promise<boolean> {
  const tokenHash = hashToken(token);
  const { data: entry } = await supabase
    .from("password_reset_tokens")
    .select("*")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (!entry || new Date(entry.expires_at) < new Date()) {
    if (entry) await supabase.from("password_reset_tokens").delete().eq("token_hash", tokenHash);
    return false;
  }

  await supabase.from("password_reset_tokens").delete().eq("token_hash", tokenHash);
  const { error } = await supabase
    .from("users")
    .update({ password_hash: bcrypt.hashSync(newPassword, 10) })
    .eq("id", entry.user_id);
  return !error;
}

export async function getOrdersForUser(userId: string): Promise<Order[]> {
  const { data } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return (data ?? []).map(toOrder);
}

export async function addOrder(order: Order): Promise<void> {
  await supabase.from("orders").insert({
    id: order.id,
    user_id: order.userId,
    type: order.type,
    label: order.label,
    amount_in_cents: order.amountInCents,
    status: order.status,
    created_at: order.createdAt,
  });
}

interface OrderRow {
  id: string;
  user_id: string;
  type: Order["type"];
  label: string;
  amount_in_cents: number;
  status: Order["status"];
  created_at: string;
}

function toOrder(row: OrderRow): Order {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    label: row.label,
    amountInCents: row.amount_in_cents,
    status: row.status,
    createdAt: row.created_at,
  };
}

// Admin-only reads — callers are responsible for verifying isAdmin first.
export async function getAllUsers(): Promise<MockUser[]> {
  const { data } = await supabase.from("users").select("*").order("created_at", { ascending: true });
  return (data ?? []).map(toMockUser);
}

export async function getAllOrders(): Promise<Order[]> {
  const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
  return (data ?? []).map(toOrder);
}

// Accepts anything with the shape of a mock user's plan/purchase fields —
// both the in-memory MockUser and the NextAuth Session["user"] satisfy this.
interface AccessSubject {
  plan: PlanId | null;
  purchasedEventSlugs: string[];
}

// All three paid plans grant full library + live event access — only an
// account with no active plan (plan === null, including a lapsed one) is
// excluded.
export function userHasSubscriberAccess(user: AccessSubject | null | undefined): boolean {
  return !!user && user.plan !== null;
}

export function userHasAccessToVideo(
  user: AccessSubject | null | undefined,
  video: Video,
  freeAccessActive = false
): boolean {
  if (freeAccessActive) return true;
  if (video.access === "free") return true;
  if (video.access === "subscribers") return userHasSubscriberAccess(user);
  if (video.access === "purchase") {
    if (!user) return false;
    if (userHasSubscriberAccess(user) && video.relatedEventSlug) {
      return true;
    }
    return video.relatedEventSlug ? user.purchasedEventSlugs.includes(video.relatedEventSlug) : false;
  }
  return false;
}

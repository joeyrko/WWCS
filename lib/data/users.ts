import bcrypt from "bcryptjs";
import { users, orders } from "@/data/users";
import type { AccessLevel, MockUser, Order, PlanId, Video, WwcEvent } from "@/types";

// Repository layer over the in-memory mock user store.
// Swap for real database calls (Prisma, Drizzle, etc.) later without touching callers.

export async function findUserByEmail(email: string): Promise<MockUser | undefined> {
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export async function findUserById(id: string): Promise<MockUser | undefined> {
  return users.find((u) => u.id === id);
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
  const user: MockUser = {
    id: `u${users.length + 1}`,
    name: input.name,
    email: input.email,
    passwordHash: bcrypt.hashSync(input.password, 10),
    plan: "free",
    purchasedEventSlugs: [],
  };
  users.push(user);
  return user;
}

export async function findOrCreateOAuthUser(input: {
  name: string;
  email: string;
  image?: string;
}): Promise<MockUser> {
  const existing = await findUserByEmail(input.email);
  if (existing) return existing;
  const user: MockUser = {
    id: `u${users.length + 1}`,
    name: input.name,
    email: input.email,
    image: input.image,
    plan: "free",
    purchasedEventSlugs: [],
  };
  users.push(user);
  return user;
}

export async function updateUserPlan(userId: string, plan: PlanId): Promise<void> {
  const user = users.find((u) => u.id === userId);
  if (user) user.plan = plan;
}

export async function grantEventPurchase(userId: string, eventSlug: string): Promise<void> {
  const user = users.find((u) => u.id === userId);
  if (user && !user.purchasedEventSlugs.includes(eventSlug)) {
    user.purchasedEventSlugs.push(eventSlug);
  }
}

export async function getOrdersForUser(userId: string): Promise<Order[]> {
  return orders
    .filter((o) => o.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function addOrder(order: Order): Promise<void> {
  orders.push(order);
}

// Admin-only reads — callers are responsible for verifying isAdmin first.
export async function getAllUsers(): Promise<MockUser[]> {
  return users;
}

export async function getAllOrders(): Promise<Order[]> {
  return [...orders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

// All three paid plans grant full library + live event access — only the
// unpaid "free" (no plan yet) state is excluded from subscriber-gated content.
const PLAN_RANK: Record<PlanId, number> = { free: 0, monthly: 1, annual: 1, legacy: 1 };

// Accepts anything with the shape of a mock user's plan/purchase fields —
// both the in-memory MockUser and the NextAuth Session["user"] satisfy this.
interface AccessSubject {
  plan: PlanId;
  purchasedEventSlugs: string[];
}

export function userHasSubscriberAccess(user: AccessSubject | null | undefined): boolean {
  return !!user && PLAN_RANK[user.plan] >= 1;
}

export function userHasAccessToVideo(user: AccessSubject | null | undefined, video: Video): boolean {
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

export function userHasAccessToEvent(user: AccessSubject | null | undefined, event: WwcEvent): boolean {
  if (event.includedInSubscription) return userHasSubscriberAccess(user);
  if (!user) return false;
  return user.purchasedEventSlugs.includes(event.slug);
}

export function accessLevelLabel(access: AccessLevel): string {
  switch (access) {
    case "free":
      return "Free";
    case "subscribers":
      return "Subscribers Only";
    case "purchase":
      return "Purchase Required";
  }
}

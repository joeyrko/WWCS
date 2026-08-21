import bcrypt from "bcryptjs";
import { users, orders } from "@/data/users";
import type { MockUser, Order, PlanId, Video } from "@/types";

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
    plan: null,
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
    plan: null,
    purchasedEventSlugs: [],
  };
  users.push(user);
  return user;
}

export async function updateUserPlan(userId: string, plan: PlanId): Promise<void> {
  const user = users.find((u) => u.id === userId);
  if (user) user.plan = plan;
}

// In-memory password reset tokens — swap for a persisted, hashed-token store
// (with the same short TTL) when moving off the mock user store.
const RESET_TOKEN_TTL_MS = 30 * 60 * 1000;
const passwordResetTokens = new Map<string, { userId: string; expiresAt: number }>();

export async function createPasswordResetToken(email: string): Promise<string | null> {
  const user = await findUserByEmail(email);
  if (!user) return null;
  const token = crypto.randomUUID();
  passwordResetTokens.set(token, { userId: user.id, expiresAt: Date.now() + RESET_TOKEN_TTL_MS });
  return token;
}

export async function resetPasswordWithToken(token: string, newPassword: string): Promise<boolean> {
  const entry = passwordResetTokens.get(token);
  if (!entry || entry.expiresAt < Date.now()) {
    passwordResetTokens.delete(token);
    return false;
  }
  const user = users.find((u) => u.id === entry.userId);
  passwordResetTokens.delete(token);
  if (!user) return false;
  user.passwordHash = bcrypt.hashSync(newPassword, 10);
  return true;
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

// Accepts anything with the shape of a mock user's plan/purchase fields —
// both the in-memory MockUser and the NextAuth Session["user"] satisfy this.
interface AccessSubject {
  plan: PlanId | null;
  purchasedEventSlugs: string[];
}

// All three paid plans grant full library + live event access — only an
// account with no active plan (plan === null) is excluded.
export function userHasSubscriberAccess(user: AccessSubject | null | undefined): boolean {
  return !!user && user.plan !== null;
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

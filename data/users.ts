import bcrypt from "bcryptjs";
import type { MockUser, Order } from "@/types";

// In-memory user + order store. Resets on server restart.
// Swap this module for a real database (e.g. Prisma + Postgres) in production —
// every function in lib/data/users.ts that reads/writes this array is the seam to change.

export const users: MockUser[] = [
  {
    id: "u1",
    name: "Alex Fan",
    email: "fan@wwc.tv",
    passwordHash: bcrypt.hashSync("wrestlemania", 10),
    plan: "annual",
    purchasedEventSlugs: ["guerra-de-titanes-2026"],
  },
  {
    id: "u2",
    name: "Jordan Champion",
    email: "champion@wwc.tv",
    passwordHash: bcrypt.hashSync("championship", 10),
    plan: "legacy",
    purchasedEventSlugs: ["guerra-de-titanes-2026", "noche-de-campeones-2025"],
  },
  {
    id: "u3",
    name: "Sam Rookie",
    email: "rookie@wwc.tv",
    passwordHash: bcrypt.hashSync("firstmatch", 10),
    plan: "free",
    purchasedEventSlugs: [],
  },
  {
    id: "u4",
    name: "WWC Admin",
    email: "admin@wwc.tv",
    passwordHash: bcrypt.hashSync("qualitycontrol", 10),
    plan: "legacy",
    purchasedEventSlugs: [],
    isAdmin: true,
  },
];

// Historical order records — amounts/labels reflect what was actually
// charged at the time and intentionally aren't updated when data/plans.ts
// changes prices, same as a real invoice history wouldn't be.
export const orders: Order[] = [
  {
    id: "o1",
    userId: "u1",
    type: "ppv",
    label: "Guerra de Titanes 2026",
    amountInCents: 1999,
    createdAt: "2026-06-14T19:00:00-04:00",
    status: "paid",
  },
  {
    id: "o2",
    userId: "u1",
    type: "subscription",
    label: "WWC+ Monthly",
    amountInCents: 999,
    createdAt: "2026-08-01T09:00:00-04:00",
    status: "paid",
  },
  {
    id: "o3",
    userId: "u2",
    type: "subscription",
    label: "WWC+ Annual",
    amountInCents: 8999,
    createdAt: "2026-01-05T09:00:00-04:00",
    status: "paid",
  },
  {
    id: "o4",
    userId: "u2",
    type: "ppv",
    label: "Noche de Campeones 2025",
    amountInCents: 1999,
    createdAt: "2025-12-06T19:00:00-04:00",
    status: "paid",
  },
];

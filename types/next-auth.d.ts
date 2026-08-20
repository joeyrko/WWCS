import type { DefaultSession } from "next-auth";
import type { PlanId } from "@/types";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      plan: PlanId | null;
      purchasedEventSlugs: string[];
      isAdmin: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    plan?: PlanId | null;
    purchasedEventSlugs?: string[];
    isAdmin?: boolean;
  }
}

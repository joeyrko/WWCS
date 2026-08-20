import { plans } from "@/data/plans";
import type { Plan, PlanId } from "@/types";

export async function getAllPlans(): Promise<Plan[]> {
  return plans;
}

export async function getPlanById(id: PlanId | null): Promise<Plan | undefined> {
  return plans.find((p) => p.id === id);
}

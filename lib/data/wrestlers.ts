import { wrestlers } from "@/data/wrestlers";
import type { Wrestler } from "@/types";

export async function getAllWrestlers(): Promise<Wrestler[]> {
  return wrestlers;
}

export async function getWrestlerBySlug(slug: string): Promise<Wrestler | undefined> {
  return wrestlers.find((w) => w.slug === slug);
}

export async function getWrestlersBySlugs(slugs: string[]): Promise<Wrestler[]> {
  return wrestlers.filter((w) => slugs.includes(w.slug));
}

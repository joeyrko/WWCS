import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-pin";
import { createLiveEvent, getAllLiveEvents } from "@/lib/data/live-events";
import { videos as staticVideos } from "@/data/videos";

const liveEventSchema = z.object({
  title: z.string().trim().min(1, "Title is required."),
  videoUrl: z.string().trim().url("Enter a valid video URL."),
  location: z.string().trim().max(200).optional().default(""),
  description: z.string().trim().max(2000).optional().default(""),
  eventDate: z.string().refine((v) => !Number.isNaN(new Date(v).getTime()), "Enter a valid date."),
});

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }
  const events = await getAllLiveEvents();
  return NextResponse.json({ events });
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = liveEventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 }
    );
  }

  try {
    const staticSlugs = new Set(staticVideos.map((v) => v.slug));
    const event = await createLiveEvent({ ...parsed.data, staticSlugs });
    return NextResponse.json({ event });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unable to create live event.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

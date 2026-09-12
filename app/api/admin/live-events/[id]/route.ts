import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-pin";
import { deleteLiveEvent, updateLiveEvent } from "@/lib/data/live-events";
import { videos as staticVideos } from "@/data/videos";

// videoUrl is optional — an event can be saved as a draft (title/date/
// location set, no link yet) and stays hidden from the public site (see
// lib/data/videos.ts) until a real link is added.
const liveEventSchema = z.object({
  title: z.string().trim().min(1, "Title is required."),
  videoUrl: z
    .string()
    .trim()
    .refine((v) => v === "" || z.string().url().safeParse(v).success, "Enter a valid video URL, or leave it blank."),
  location: z.string().trim().max(200).optional().default(""),
  description: z.string().trim().max(2000).optional().default(""),
  eventDate: z.string().refine((v) => !Number.isNaN(new Date(v).getTime()), "Enter a valid date."),
});

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const { id } = await params;
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
    const event = await updateLiveEvent(id, { ...parsed.data, staticSlugs });
    return NextResponse.json({ event });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unable to update live event.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const { id } = await params;
  await deleteLiveEvent(id);
  return NextResponse.json({ ok: true });
}

import Link from "next/link";
import { Play } from "lucide-react";
import { Poster } from "@/components/media/poster";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { getVideoByEventSlug } from "@/lib/data/videos";
import type { WwcEvent } from "@/types";

export async function PastEventRow({ event }: { event: WwcEvent }) {
  const replay = await getVideoByEventSlug(event.slug);

  return (
    <div className="flex flex-col gap-4 rounded-md border border-wwc-grey-800 bg-wwc-grey-950 p-4 sm:flex-row sm:items-center">
      <Poster
        seed={event.slug}
        title={event.title}
        aspect="video"
        monogram={false}
        className="w-full sm:w-56"
      />
      <div className="flex flex-1 flex-col gap-1.5">
        <h3 className="font-display text-xl uppercase tracking-wide text-white">{event.title}</h3>
        <p className="text-sm text-wwc-grey-400">
          {formatDate(event.date, { month: "long", day: "numeric", year: "numeric" })} —{" "}
          {event.venue}, {event.city}
        </p>
        <p className="line-clamp-1 text-sm text-wwc-grey-500">{event.description}</p>
      </div>
      <div className="sm:pl-4">
        <Button asChild variant="outline">
          <Link href={replay ? `/watch/${replay.slug}` : "/watch"} className="flex items-center gap-2">
            <Play className="h-4 w-4" /> Watch Replay
          </Link>
        </Button>
      </div>
    </div>
  );
}

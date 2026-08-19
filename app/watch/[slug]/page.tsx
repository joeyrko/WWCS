import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar } from "lucide-react";
import { getSession } from "@/lib/get-session";
import { videos } from "@/data/videos";
import { getRelatedVideos, getVideoBySlug } from "@/lib/data/videos";
import { getWrestlersBySlugs } from "@/lib/data/wrestlers";
import { userHasAccessToVideo } from "@/lib/data/users";
import { AccessBadge } from "@/components/shared/access-badge";
import { VideoPlayer } from "@/components/watch/video-player";
import { AccessGate } from "@/components/watch/access-gate";
import { RelatedVideosRail } from "@/components/watch/related-videos-rail";
import { formatDate } from "@/lib/utils";

export function generateStaticParams() {
  return videos.map((video) => ({ slug: video.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const video = await getVideoBySlug(slug);
  if (!video) return {};

  return {
    title: video.title,
    description: video.description,
    openGraph: { title: video.title, description: video.description },
  };
}

export default async function WatchDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const video = await getVideoBySlug(slug);
  if (!video) notFound();

  const [session, related, wrestlers] = await Promise.all([
    getSession(),
    getRelatedVideos(video),
    getWrestlersBySlugs(video.wrestlers),
  ]);

  const hasAccess = userHasAccessToVideo(session?.user, video);

  return (
    <div className="pt-24 sm:pt-28">
      <div className="mx-auto max-w-4xl px-4 pb-10 sm:px-6 lg:px-8">
        {hasAccess ? (
            <VideoPlayer src={video.videoUrl} title={video.title} seed={video.slug} />
          ) : (
            <AccessGate video={video} signedIn={!!session?.user} />
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <AccessBadge access={video.access} />
            <span className="flex items-center gap-1.5 text-sm text-wwc-grey-500">
              <Calendar className="h-4 w-4" />
              {formatDate(video.publishedAt, { month: "long", day: "numeric", year: "numeric" })}
            </span>
          </div>

          <h1 className="mt-3 font-display text-3xl uppercase leading-tight tracking-wide text-white sm:text-4xl">
            {video.title}
          </h1>
          <p className="mt-3 text-wwc-grey-300">{video.description}</p>

          {wrestlers.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {wrestlers.map((w) => (
                <span
                  key={w.slug}
                  className="rounded-sm border border-wwc-grey-800 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-wwc-grey-300"
                >
                  {w.name}
                </span>
              ))}
            </div>
          )}

          {video.relatedEventSlug && (
            <Link
              href={`/events/${video.relatedEventSlug}`}
              className="mt-6 inline-block text-sm font-semibold text-wwc-red hover:underline"
            >
              View full event card →
            </Link>
          )}
      </div>

      <div className="mt-4 border-t border-wwc-grey-900 pt-10">
        <RelatedVideosRail videos={related} />
      </div>
    </div>
  );
}

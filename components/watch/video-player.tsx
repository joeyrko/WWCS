import { getVideoEmbed } from "@/lib/video-embed";

export function VideoPlayer({ src, title }: { src: string; title: string }) {
  const embed = getVideoEmbed(src);

  return (
    <div className="overflow-hidden rounded-md border border-wwc-grey-800 bg-black">
      {embed.kind === "file" ? (
        <video controls className="aspect-video w-full">
          <source src={src} />
        </video>
      ) : (
        <iframe
          src={embed.embedUrl}
          title={title}
          className="aspect-video w-full"
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
          allowFullScreen
        />
      )}
    </div>
  );
}

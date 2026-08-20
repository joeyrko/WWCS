// Detects which platform a stored videoUrl points to and produces the right
// iframe embed URL. Videos on this site are sourced as share/watch links
// from YouTube, Google Drive, or Rumble rather than self-hosted files, so
// the player needs to normalize each platform's link shape into its embed
// form instead of treating every videoUrl as a direct <video> source.
export type VideoEmbed = { kind: "youtube" | "drive" | "rumble"; embedUrl: string } | { kind: "file" };

export function getVideoEmbed(url: string): VideoEmbed {
  try {
    const parsed = new URL(url, "http://localhost");
    const host = parsed.hostname.replace(/^www\./, "");

    if (host === "youtube.com" || host === "youtube-nocookie.com" || host === "youtu.be") {
      const id =
        host === "youtu.be"
          ? parsed.pathname.slice(1)
          : parsed.pathname.startsWith("/embed/")
            ? parsed.pathname.split("/embed/")[1]
            : parsed.searchParams.get("v");
      if (id) return { kind: "youtube", embedUrl: `https://www.youtube-nocookie.com/embed/${id}` };
    }

    if (host === "drive.google.com") {
      // Share links look like /file/d/<id>/view — the embeddable form swaps
      // the trailing segment for /preview.
      const match = parsed.pathname.match(/\/file\/d\/([^/]+)/);
      if (match) return { kind: "drive", embedUrl: `https://drive.google.com/file/d/${match[1]}/preview` };
    }

    if (host === "rumble.com") {
      if (parsed.pathname.startsWith("/embed/")) {
        return { kind: "rumble", embedUrl: url };
      }
      // Regular watch links look like /v<id>-<slug>.html — Rumble's embed
      // path uses the same <id>.
      const match = parsed.pathname.match(/^\/(v[a-z0-9]+)-/i);
      if (match) return { kind: "rumble", embedUrl: `https://rumble.com/embed/${match[1]}/` };
    }
  } catch {
    // Not a valid absolute URL (e.g. a local /mock-media path) — fall through to file playback.
  }

  return { kind: "file" };
}

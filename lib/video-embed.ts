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
      // autoplay=1 starts playback without the viewer clicking the embed
      // first — necessary on the Android TV app, where there's no cursor to
      // click with. Browsers that require a gesture for audible autoplay
      // just mute it automatically; nothing breaks there either.
      if (id) return { kind: "youtube", embedUrl: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1` };
    }

    if (host === "drive.google.com") {
      // Share links look like /file/d/<id>/view — the embeddable form swaps
      // the trailing segment for /preview. Drive's preview player has no
      // documented autoplay parameter, so this one still needs a click.
      const match = parsed.pathname.match(/\/file\/d\/([^/]+)/);
      if (match) return { kind: "drive", embedUrl: `https://drive.google.com/file/d/${match[1]}/preview` };
    }

    if (host === "rumble.com") {
      if (parsed.pathname.startsWith("/embed/")) {
        const embedUrl = new URL(url);
        embedUrl.searchParams.set("autoplay", "2");
        return { kind: "rumble", embedUrl: embedUrl.toString() };
      }
      // Regular watch links look like /v<id>-<slug>.html — Rumble's embed
      // path uses the same <id>. Rumble's own autoplay flag is "2", not "1".
      const match = parsed.pathname.match(/^\/(v[a-z0-9]+)-/i);
      if (match) return { kind: "rumble", embedUrl: `https://rumble.com/embed/${match[1]}/?autoplay=2` };
    }
  } catch {
    // Not a valid absolute URL (e.g. a local /mock-media path) — fall through to file playback.
  }

  return { kind: "file" };
}

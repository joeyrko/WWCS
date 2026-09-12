"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { formatDate, isRealThumbnail } from "@/lib/utils";
import { CATEGORY_ROW_LABEL, CATEGORY_ROW_ORDER } from "@/lib/show-types";
import type { CatalogVideoRow, CatalogShowType } from "@/lib/data/catalog-videos";
import type { AccessLevel } from "@/types";

// "Live Event" is excluded — that category is exclusively assigned through
// the separate Live Events section above, never picked from this dropdown.
// Same list/order/labels the Home and History pages use for their browse
// rows (see lib/show-types.ts), so this dropdown always matches what a
// visitor actually sees.
const SHOW_TYPES = CATEGORY_ROW_ORDER.filter((c) => c !== "live-event") as CatalogShowType[];
const SHOW_TYPE_LABEL = CATEGORY_ROW_LABEL;

const ACCESS_LABEL: Record<AccessLevel, string> = {
  free: "Free",
  subscribers: "Subscribers",
  purchase: "Purchase",
};
const ACCESS_LEVELS = Object.keys(ACCESS_LABEL) as AccessLevel[];

type FormState = {
  title: string;
  videoUrl: string;
  location: string;
  description: string;
  publishedAt: string;
  showType: CatalogShowType;
  access: AccessLevel;
};

const EMPTY_FORM: FormState = {
  title: "",
  videoUrl: "",
  location: "",
  description: "",
  publishedAt: "",
  showType: "dark-match",
  access: "subscribers",
};

// Same Puerto Rico (AST, UTC-04:00, no DST) convention the live events
// section and the static catalog both already use for dates.
const PR_OFFSET = "-04:00";

function isoToLocalInput(iso: string): string {
  const match = iso.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})/);
  return match ? match[1] : "";
}

function localInputToIso(local: string): string {
  return local ? `${local}:00${PR_OFFSET}` : "";
}

export function CatalogVideosManager({ videos }: { videos: CatalogVideoRow[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<CatalogVideoRow | "new" | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [removeThumbnail, setRemoveThumbnail] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function resetThumbnail(existingUrl?: string) {
    setThumbnailFile(null);
    setThumbnailPreview(existingUrl && isRealThumbnail(existingUrl) ? existingUrl : null);
    setRemoveThumbnail(false);
  }

  function openAdd() {
    setForm(EMPTY_FORM);
    resetThumbnail();
    setEditing("new");
  }

  function openEdit(video: CatalogVideoRow) {
    setForm({
      title: video.title,
      videoUrl: video.videoUrl,
      location: video.location ?? "",
      description: video.description,
      publishedAt: isoToLocalInput(video.publishedAt),
      showType: video.showType,
      access: video.access,
    });
    resetThumbnail(video.thumbnailUrl ?? undefined);
    setEditing(video);
  }

  function onThumbnailChange(selected: File | null) {
    setThumbnailFile(selected);
    setRemoveThumbnail(false);
    setThumbnailPreview((prev) => {
      if (prev && prev.startsWith("blob:")) URL.revokeObjectURL(prev);
      return selected ? URL.createObjectURL(selected) : null;
    });
  }

  function onRemoveThumbnail() {
    if (thumbnailPreview?.startsWith("blob:")) URL.revokeObjectURL(thumbnailPreview);
    setThumbnailFile(null);
    setThumbnailPreview(null);
    setRemoveThumbnail(true);
  }

  async function submit() {
    if (!editing) return;
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("title", form.title.trim());
      formData.append("videoUrl", form.videoUrl.trim());
      formData.append("location", form.location.trim());
      formData.append("description", form.description.trim());
      formData.append("publishedAt", localInputToIso(form.publishedAt));
      formData.append("showType", form.showType);
      formData.append("access", form.access);
      if (thumbnailFile) formData.append("thumbnail", thumbnailFile);
      formData.append("removeThumbnail", String(removeThumbnail));

      const res =
        editing === "new"
          ? await fetch("/api/admin/catalog-videos", { method: "POST", body: formData })
          : await fetch(`/api/admin/catalog-videos/${editing.id}`, { method: "PUT", body: formData });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        toast.error(data?.error ?? "Something went wrong saving that event.");
        return;
      }

      toast.success(editing === "new" ? "Event created." : "Event updated.");
      setEditing(null);
      router.refresh();
    } catch {
      toast.error("Something went wrong saving that event.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(video: CatalogVideoRow) {
    if (!window.confirm(`Permanently delete "${video.title}"? This can't be undone.`)) return;

    setDeletingId(video.id);
    try {
      const res = await fetch(`/api/admin/catalog-videos/${video.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        toast.error(data?.error ?? "Something went wrong deleting that event.");
        return;
      }
      toast.success("Event deleted.");
      router.refresh();
    } catch {
      toast.error("Something went wrong deleting that event.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-2xl uppercase tracking-wide text-white">Events</h2>
        <Button size="sm" onClick={openAdd} className="flex items-center gap-1.5">
          <Plus className="h-4 w-4" /> Add Event
        </Button>
      </div>

      <div className="overflow-x-auto rounded-md border border-wwc-grey-800">
        <table className="w-full min-w-[880px] text-left text-sm">
          <thead className="bg-wwc-grey-900 text-xs uppercase tracking-wide text-wwc-grey-400">
            <tr>
              <th className="px-4 py-3 font-semibold">Thumbnail</th>
              <th className="px-4 py-3 font-semibold">Title</th>
              <th className="px-4 py-3 font-semibold">Category</th>
              <th className="px-4 py-3 font-semibold">Access</th>
              <th className="px-4 py-3 font-semibold">Date</th>
              <th className="px-4 py-3 font-semibold">Location</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-wwc-grey-800 bg-wwc-grey-950">
            {videos.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-wwc-grey-500">
                  No events added here yet.
                </td>
              </tr>
            )}
            {videos.map((video) => (
              <tr key={video.id}>
                <td className="px-4 py-3">
                  {video.thumbnailUrl ? (
                    <div className="relative h-10 w-16 overflow-hidden rounded-sm bg-wwc-black">
                      <Image src={video.thumbnailUrl} alt="" fill className="object-cover" />
                    </div>
                  ) : (
                    <span className="text-wwc-grey-500">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-white">
                  <div className="flex items-center gap-2">
                    {video.title}
                    {!video.videoUrl && (
                      <Badge variant="outline" title="No link yet — hidden from the site">
                        Draft
                      </Badge>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 uppercase text-wwc-grey-400">{SHOW_TYPE_LABEL[video.showType]}</td>
                <td className="px-4 py-3 uppercase text-wwc-grey-400">{ACCESS_LABEL[video.access]}</td>
                <td className="px-4 py-3 text-wwc-grey-400">
                  {formatDate(video.publishedAt, { month: "short", day: "numeric", year: "numeric" })}
                </td>
                <td className="px-4 py-3 text-wwc-grey-400">{video.location || "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => openEdit(video)}
                      aria-label={`Edit ${video.title}`}
                      className="text-wwc-grey-400 transition-colors hover:text-white"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(video)}
                      disabled={deletingId === video.id}
                      aria-label={`Delete ${video.title}`}
                      className="text-wwc-grey-400 transition-colors hover:text-wwc-red disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog
        open={editing !== null}
        onOpenChange={(open) => {
          if (!open && thumbnailPreview?.startsWith("blob:")) URL.revokeObjectURL(thumbnailPreview);
          if (!open) setEditing(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing === "new" ? "Add Event" : "Edit Event"}</DialogTitle>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="video-title">Title</Label>
              <Input
                id="video-title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="video-url">Event Link (optional)</Label>
              <Input
                id="video-url"
                type="url"
                placeholder="https://youtube.com/watch?v=..."
                value={form.videoUrl}
                onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
              />
              <p className="text-xs text-wwc-grey-500">
                Leave blank to save as a draft — hidden from the site until you add a link.
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="video-thumbnail">Thumbnail (optional)</Label>
              <Input
                id="video-thumbnail"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={(e) => onThumbnailChange(e.target.files?.[0] ?? null)}
              />
              <p className="text-xs text-wwc-grey-500">
                PNG, JPEG, WebP, or GIF — 5MB max. Without one, a generated card is used instead.
              </p>
              {thumbnailPreview && (
                <div className="relative mt-1 aspect-video w-full max-w-[240px] overflow-hidden rounded-md border border-wwc-grey-800 bg-wwc-black">
                  {/* Local blob: preview uses a plain img; a saved thumbnail uses next/image. */}
                  {thumbnailPreview.startsWith("blob:") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={thumbnailPreview} alt="Preview" className="h-full w-full object-cover" />
                  ) : (
                    <Image src={thumbnailPreview} alt="Preview" fill className="object-cover" />
                  )}
                  <button
                    type="button"
                    onClick={onRemoveThumbnail}
                    aria-label="Remove thumbnail"
                    className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white hover:text-wwc-red"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="video-category">Category</Label>
                <Select
                  value={form.showType}
                  onValueChange={(value) => setForm({ ...form, showType: value as CatalogShowType })}
                >
                  <SelectTrigger id="video-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SHOW_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {SHOW_TYPE_LABEL[type]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="video-access">Access</Label>
                <Select
                  value={form.access}
                  onValueChange={(value) => setForm({ ...form, access: value as AccessLevel })}
                >
                  <SelectTrigger id="video-access">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ACCESS_LEVELS.map((level) => (
                      <SelectItem key={level} value={level}>
                        {ACCESS_LABEL[level]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="video-date">Date &amp; Time (Puerto Rico)</Label>
              <Input
                id="video-date"
                type="datetime-local"
                value={form.publishedAt}
                onChange={(e) => setForm({ ...form, publishedAt: e.target.value })}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="video-location">Location (optional)</Label>
              <Input
                id="video-location"
                placeholder="Coliseo Rubén Rodríguez, Bayamón"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="video-description">Description (optional)</Label>
              <textarea
                id="video-description"
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="flex w-full rounded-sm border border-wwc-grey-700 bg-wwc-grey-900 px-3.5 py-2 text-sm text-wwc-white placeholder:text-wwc-grey-500 transition-colors focus-visible:border-wwc-red focus-visible:outline-none"
              />
            </div>

            <Button type="submit" disabled={saving} className="mt-2 w-full">
              {editing === "new" ? "Create Event" : "Save Changes"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

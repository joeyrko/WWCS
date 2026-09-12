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
import { Badge } from "@/components/ui/badge";
import { formatDate, isRealThumbnail } from "@/lib/utils";
import type { LiveEventRow } from "@/lib/data/live-events";

type FormState = { title: string; videoUrl: string; location: string; description: string; eventDate: string };

const EMPTY_FORM: FormState = { title: "", videoUrl: "", location: "", description: "", eventDate: "" };

// Live events are stored in Puerto Rico's timezone (AST, UTC-04:00, no DST)
// — same convention the static catalog's own live-event entry already uses
// (see data/videos.ts). The <input type="datetime-local"> gives back a
// timezone-less string; this is what turns that into a real instant, and
// the reverse for populating the field when editing.
const PR_OFFSET = "-04:00";

function isoToLocalInput(iso: string): string {
  // "2026-09-26T20:00:00-04:00" -> "2026-09-26T20:00", assuming the stored
  // instant already carries the PR offset (true for anything created here).
  const match = iso.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})/);
  return match ? match[1] : "";
}

function localInputToIso(local: string): string {
  return local ? `${local}:00${PR_OFFSET}` : "";
}

export function LiveEventsManager({ events }: { events: LiveEventRow[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<LiveEventRow | "new" | null>(null);
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

  function openEdit(event: LiveEventRow) {
    setForm({
      title: event.title,
      videoUrl: event.videoUrl,
      location: event.location ?? "",
      description: event.description,
      eventDate: isoToLocalInput(event.eventDate),
    });
    resetThumbnail(event.thumbnailUrl ?? undefined);
    setEditing(event);
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
      formData.append("eventDate", localInputToIso(form.eventDate));
      if (thumbnailFile) formData.append("thumbnail", thumbnailFile);
      formData.append("removeThumbnail", String(removeThumbnail));

      const res =
        editing === "new"
          ? await fetch("/api/admin/live-events", { method: "POST", body: formData })
          : await fetch(`/api/admin/live-events/${editing.id}`, { method: "PUT", body: formData });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        toast.error(data?.error ?? "Something went wrong saving that event.");
        return;
      }

      toast.success(editing === "new" ? "Live event created." : "Live event updated.");
      setEditing(null);
      router.refresh();
    } catch {
      toast.error("Something went wrong saving that event.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(event: LiveEventRow) {
    if (!window.confirm(`Permanently delete "${event.title}"? This can't be undone.`)) return;

    setDeletingId(event.id);
    try {
      const res = await fetch(`/api/admin/live-events/${event.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        toast.error(data?.error ?? "Something went wrong deleting that event.");
        return;
      }
      toast.success("Live event deleted.");
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
        <h2 className="font-display text-2xl uppercase tracking-wide text-white">Live Events</h2>
        <Button size="sm" onClick={openAdd} className="flex items-center gap-1.5">
          <Plus className="h-4 w-4" /> Add Live Event
        </Button>
      </div>

      <div className="overflow-x-auto rounded-md border border-wwc-grey-800">
        <table className="w-full min-w-[780px] text-left text-sm">
          <thead className="bg-wwc-grey-900 text-xs uppercase tracking-wide text-wwc-grey-400">
            <tr>
              <th className="px-4 py-3 font-semibold">Thumbnail</th>
              <th className="px-4 py-3 font-semibold">Title</th>
              <th className="px-4 py-3 font-semibold">Date</th>
              <th className="px-4 py-3 font-semibold">Location</th>
              <th className="px-4 py-3 font-semibold">Link</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-wwc-grey-800 bg-wwc-grey-950">
            {events.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-wwc-grey-500">
                  No live events yet.
                </td>
              </tr>
            )}
            {events.map((event) => (
              <tr key={event.id}>
                <td className="px-4 py-3">
                  {event.thumbnailUrl ? (
                    <div className="relative h-10 w-16 overflow-hidden rounded-sm bg-wwc-black">
                      <Image src={event.thumbnailUrl} alt="" fill className="object-cover" />
                    </div>
                  ) : (
                    <span className="text-wwc-grey-500">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-white">
                  <div className="flex items-center gap-2">
                    {event.title}
                    {!event.videoUrl && (
                      <Badge variant="outline" title="No link yet — hidden from the site">
                        Draft
                      </Badge>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-wwc-grey-400">
                  {formatDate(event.eventDate, { month: "short", day: "numeric", year: "numeric" })}
                </td>
                <td className="px-4 py-3 text-wwc-grey-400">{event.location || "—"}</td>
                <td className="max-w-[200px] truncate px-4 py-3 text-wwc-grey-400">
                  {event.videoUrl ? (
                    <a
                      href={event.videoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-wwc-white hover:underline"
                    >
                      {event.videoUrl}
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => openEdit(event)}
                      aria-label={`Edit ${event.title}`}
                      className="text-wwc-grey-400 transition-colors hover:text-white"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(event)}
                      disabled={deletingId === event.id}
                      aria-label={`Delete ${event.title}`}
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
            <DialogTitle>{editing === "new" ? "Add Live Event" : "Edit Live Event"}</DialogTitle>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="event-title">Title</Label>
              <Input
                id="event-title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="event-video-url">Video Link (optional)</Label>
              <Input
                id="event-video-url"
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
              <Label htmlFor="event-thumbnail">Thumbnail (optional)</Label>
              <Input
                id="event-thumbnail"
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

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="event-date">Date &amp; Time (Puerto Rico)</Label>
              <Input
                id="event-date"
                type="datetime-local"
                value={form.eventDate}
                onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="event-location">Location</Label>
              <Input
                id="event-location"
                placeholder="Coliseo Rubén Rodríguez, Bayamón"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="event-description">Description (optional)</Label>
              <textarea
                id="event-description"
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="flex w-full rounded-sm border border-wwc-grey-700 bg-wwc-grey-900 px-3.5 py-2 text-sm text-wwc-white placeholder:text-wwc-grey-500 transition-colors focus-visible:border-wwc-red focus-visible:outline-none"
              />
            </div>

            <Button type="submit" disabled={saving} className="mt-2 w-full">
              {editing === "new" ? "Create Live Event" : "Save Changes"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

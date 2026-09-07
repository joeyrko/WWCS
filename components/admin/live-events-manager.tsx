"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";
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
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function openAdd() {
    setForm(EMPTY_FORM);
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
    setEditing(event);
  }

  async function submit() {
    if (!editing) return;
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        videoUrl: form.videoUrl.trim(),
        location: form.location.trim(),
        description: form.description.trim(),
        eventDate: localInputToIso(form.eventDate),
      };

      const res =
        editing === "new"
          ? await fetch("/api/admin/live-events", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            })
          : await fetch(`/api/admin/live-events/${editing.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });

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
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-wwc-grey-900 text-xs uppercase tracking-wide text-wwc-grey-400">
            <tr>
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
                <td colSpan={5} className="px-4 py-6 text-center text-wwc-grey-500">
                  No live events yet.
                </td>
              </tr>
            )}
            {events.map((event) => (
              <tr key={event.id}>
                <td className="px-4 py-3 text-white">{event.title}</td>
                <td className="px-4 py-3 text-wwc-grey-400">
                  {formatDate(event.eventDate, { month: "short", day: "numeric", year: "numeric" })}
                </td>
                <td className="px-4 py-3 text-wwc-grey-400">{event.location || "—"}</td>
                <td className="max-w-[200px] truncate px-4 py-3 text-wwc-grey-400">
                  <a
                    href={event.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-wwc-white hover:underline"
                  >
                    {event.videoUrl}
                  </a>
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

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
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
              <Label htmlFor="event-video-url">Video Link</Label>
              <Input
                id="event-video-url"
                type="url"
                placeholder="https://youtube.com/watch?v=..."
                value={form.videoUrl}
                onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                required
              />
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

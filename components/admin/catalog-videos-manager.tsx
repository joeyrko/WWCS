"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
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
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function openAdd() {
    setForm(EMPTY_FORM);
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
    setEditing(video);
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
        publishedAt: localInputToIso(form.publishedAt),
        showType: form.showType,
        access: form.access,
      };

      const res =
        editing === "new"
          ? await fetch("/api/admin/catalog-videos", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            })
          : await fetch(`/api/admin/catalog-videos/${editing.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });

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
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="bg-wwc-grey-900 text-xs uppercase tracking-wide text-wwc-grey-400">
            <tr>
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
                <td colSpan={6} className="px-4 py-6 text-center text-wwc-grey-500">
                  No events added here yet.
                </td>
              </tr>
            )}
            {videos.map((video) => (
              <tr key={video.id}>
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

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
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

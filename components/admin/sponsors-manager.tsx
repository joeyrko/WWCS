"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Sponsor } from "@/types";

export function SponsorsManager({ sponsors }: { sponsors: Sponsor[] }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function openAdd() {
    setName("");
    setFile(null);
    setPreviewUrl(null);
    setAdding(true);
  }

  function onFileChange(selected: File | null) {
    setFile(selected);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return selected ? URL.createObjectURL(selected) : null;
    });
  }

  async function submit() {
    if (!file) {
      toast.error("Choose an image to upload.");
      return;
    }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("image", file);

      const res = await fetch("/api/admin/sponsors", { method: "POST", body: formData });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        toast.error(data?.error ?? "Something went wrong uploading that sponsor.");
        return;
      }

      toast.success("Sponsor added.");
      setAdding(false);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      router.refresh();
    } catch {
      toast.error("Something went wrong uploading that sponsor.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(sponsor: Sponsor) {
    if (!window.confirm(`Remove "${sponsor.name}" from the sponsor slideshow?`)) return;

    setDeletingId(sponsor.id);
    try {
      const res = await fetch(`/api/admin/sponsors/${sponsor.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        toast.error(data?.error ?? "Something went wrong removing that sponsor.");
        return;
      }
      toast.success("Sponsor removed.");
      router.refresh();
    } catch {
      toast.error("Something went wrong removing that sponsor.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-2xl uppercase tracking-wide text-white">Sponsors</h2>
        <Button size="sm" onClick={openAdd} className="flex items-center gap-1.5">
          <Plus className="h-4 w-4" /> Add Sponsor
        </Button>
      </div>

      {sponsors.length === 0 ? (
        <div className="rounded-md border border-dashed border-wwc-grey-800 py-10 text-center text-wwc-grey-500">
          No sponsors yet — the slideshow won&apos;t show anything until you add one.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {sponsors.map((sponsor) => (
            <div
              key={sponsor.id}
              className="group relative overflow-hidden rounded-md border border-wwc-grey-800 bg-wwc-grey-950"
            >
              <div className="relative aspect-video w-full bg-wwc-black">
                {sponsor.imageUrl && (
                  <Image src={sponsor.imageUrl} alt={sponsor.name} fill className="object-contain p-2" />
                )}
              </div>
              <p className="truncate px-2 py-1.5 text-xs text-wwc-grey-400">{sponsor.name}</p>
              <button
                type="button"
                onClick={() => remove(sponsor)}
                disabled={deletingId === sponsor.id}
                aria-label={`Remove ${sponsor.name}`}
                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white opacity-0 transition-opacity hover:text-wwc-red disabled:cursor-not-allowed disabled:opacity-30 group-hover:opacity-100"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <Dialog
        open={adding}
        onOpenChange={(open) => {
          if (!open && previewUrl) URL.revokeObjectURL(previewUrl);
          setAdding(open);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Sponsor</DialogTitle>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="sponsor-name">Sponsor Name</Label>
              <Input id="sponsor-name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="sponsor-image">Image</Label>
              <Input
                id="sponsor-image"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
                required
              />
              <p className="text-xs text-wwc-grey-500">PNG, JPEG, WebP, GIF, or SVG — 5MB max.</p>
            </div>

            {previewUrl && (
              <div className="relative aspect-video w-full overflow-hidden rounded-md border border-wwc-grey-800 bg-wwc-black">
                {/* Plain img, not next/image — this is a local blob: URL preview, not a real remote src. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewUrl} alt="Preview" className="h-full w-full object-contain p-2" />
              </div>
            )}

            <Button type="submit" disabled={saving} className="mt-2 w-full">
              Add Sponsor
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-pin";
import { createSponsor, getAllSponsors } from "@/lib/data/sponsors";

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }
  const sponsors = await getAllSponsors();
  return NextResponse.json({ sponsors });
}

// multipart/form-data, not JSON — this is the one admin form that uploads a
// real file rather than just text fields.
export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ error: "Invalid form submission." }, { status: 400 });
  }

  const name = formData.get("name");
  const tagline = formData.get("tagline");
  const file = formData.get("image");

  if (typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Sponsor name is required." }, { status: 400 });
  }
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "An image file is required." }, { status: 400 });
  }

  try {
    const sponsor = await createSponsor({
      name: name.trim(),
      tagline: typeof tagline === "string" ? tagline.trim() : "",
      file,
    });
    return NextResponse.json({ sponsor });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unable to create sponsor.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

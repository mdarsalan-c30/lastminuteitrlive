import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/rbac";

const MAX_BYTES = 3 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request, "editContent");
  if (auth instanceof NextResponse) return auth;

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File) || !ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: "Choose a PNG, JPG or WebP image." }, { status: 400 });
  }
  if (file.size <= 0 || file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image must be smaller than 3 MB." }, { status: 400 });
  }

  const upload = new FormData();
  upload.append("file", file);
  upload.append("upload_preset", "LMITRBLOG");
  upload.append("folder", "LMTR_HERO_OFFER_RIBBON_V2");

  const response = await fetch("https://api.cloudinary.com/v1_1/g2ntyyz4/image/upload", {
    method: "POST",
    body: upload,
  });
  const data = await response.json();
  if (!response.ok || typeof data.secure_url !== "string") {
    return NextResponse.json(
      { error: data.error?.message || "Image upload failed." },
      { status: response.ok ? 502 : response.status }
    );
  }

  return NextResponse.json({ ok: true, url: data.secure_url });
}

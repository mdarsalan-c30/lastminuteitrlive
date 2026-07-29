import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);
const attempts = new Map<string, { count: number; resetAt: number }>();

function field(form: FormData, key: string, max: number, required = false) {
  const value = String(form.get(key) ?? "").trim();
  if (required && !value) throw new Error(`${key} is required.`);
  if (value.length > max) throw new Error(`${key} is too long.`);
  return value;
}

function profileUrl(value: string) {
  if (!value) return null;
  const url = new URL(value);
  if (url.protocol !== "https:") throw new Error("Profile URL must use https://.");
  return url.toString();
}

function allowed(request: NextRequest) {
  const key = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const now = Date.now();
  const current = attempts.get(key);
  if (!current || current.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + 86_400_000 });
    return true;
  }
  if (current.count >= 3) return false;
  current.count += 1;
  return true;
}

async function uploadPhoto(file: File) {
  if (!ALLOWED_IMAGE_TYPES.has(file.type) || file.size <= 0 || file.size > MAX_IMAGE_BYTES) {
    throw new Error("Profile photo must be a PNG, JPG or WebP smaller than 3 MB.");
  }
  const upload = new FormData();
  upload.append("file", file);
  upload.append("upload_preset", "LMITRBLOG");
  upload.append("folder", "LMTR_REVIEW_AVATARS");
  const response = await fetch("https://api.cloudinary.com/v1_1/g2ntyyz4/image/upload", { method: "POST", body: upload });
  const data = await response.json();
  if (!response.ok || typeof data.secure_url !== "string") throw new Error("Profile photo upload failed. Try again without a photo.");
  return data.secure_url as string;
}

export async function POST(request: NextRequest) {
  try {
    if (!allowed(request)) return NextResponse.json({ error: "Review submission limit reached. Please try again tomorrow." }, { status: 429 });
    const form = await request.formData();
    if (String(form.get("website") ?? "").trim()) return NextResponse.json({ ok: true });

    const name = field(form, "name", 80, true);
    const quote = field(form, "quote", 700, true);
    if (quote.length < 10) throw new Error("Review must be at least 10 characters.");
    const rating = Number(form.get("rating"));
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new Error("Choose a rating from 1 to 5.");
    const photo = form.get("photo");
    const avatarUrl = photo instanceof File && photo.size > 0 ? await uploadPhoto(photo) : null;

    const review = await prisma.review.create({
      data: {
        name,
        role: field(form, "role", 80) || null,
        city: field(form, "city", 80) || null,
        quote,
        rating,
        plan: field(form, "plan", 40) || null,
        outcomeTag: field(form, "outcomeTag", 80) || null,
        profileUrl: profileUrl(field(form, "profileUrl", 500)),
        avatarUrl,
        published: false,
        order: 0,
      },
      select: { id: true },
    });
    return NextResponse.json({ ok: true, id: review.id, status: "pending" }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to submit review." }, { status: 400 });
  }
}

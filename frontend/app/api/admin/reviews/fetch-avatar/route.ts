import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/rbac";

const MAX_BYTES = 3 * 1024 * 1024;

function isLinkedInProfile(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      (url.hostname === "linkedin.com" || url.hostname === "www.linkedin.com") &&
      url.pathname.startsWith("/in/")
    );
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request, "editContent");
  if (auth instanceof NextResponse) return auth;

  const body = (await request.json()) as { profileUrl?: string };
  const profileUrl = body.profileUrl?.trim() ?? "";
  if (!isLinkedInProfile(profileUrl)) {
    return NextResponse.json(
      { error: "Automatic photo fetch supports public LinkedIn /in/ profile URLs only." },
      { status: 400 }
    );
  }

  try {
    const pageResponse = await fetch(profileUrl, {
      redirect: "follow",
      signal: AbortSignal.timeout(8000),
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; LastminuteITRReviewPreview/1.0)",
        Accept: "text/html",
      },
    });
    if (!pageResponse.ok) throw new Error("LinkedIn did not allow access to this profile.");
    const html = await pageResponse.text();
    const imageUrl =
      html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)?.[1] ??
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)?.[1];
    if (!imageUrl?.startsWith("https://")) {
      throw new Error("No public profile photo was available. Upload one manually.");
    }

    const imageResponse = await fetch(imageUrl, {
      signal: AbortSignal.timeout(8000),
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    const contentType = imageResponse.headers.get("content-type") ?? "";
    const bytes = await imageResponse.arrayBuffer();
    if (
      !imageResponse.ok ||
      !["image/jpeg", "image/png", "image/webp"].some((type) => contentType.startsWith(type)) ||
      bytes.byteLength <= 0 ||
      bytes.byteLength > MAX_BYTES
    ) {
      throw new Error("LinkedIn photo could not be imported. Upload it manually.");
    }

    const extension = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";
    const uploadData = new FormData();
    uploadData.append(
      "file",
      new File([bytes], `linkedin-profile.${extension}`, { type: contentType.split(";")[0] })
    );
    uploadData.append("upload_preset", "LMITRBLOG");
    uploadData.append("folder", "LMTR_REVIEW_AVATARS");
    const uploadResponse = await fetch(
      "https://api.cloudinary.com/v1_1/g2ntyyz4/image/upload",
      { method: "POST", body: uploadData }
    );
    const uploaded = await uploadResponse.json();
    if (!uploadResponse.ok || typeof uploaded.secure_url !== "string") {
      throw new Error("Profile photo import failed. Upload it manually.");
    }
    return NextResponse.json({ ok: true, url: uploaded.secure_url });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "LinkedIn blocked automatic access. Upload the photo manually.",
      },
      { status: 422 }
    );
  }
}

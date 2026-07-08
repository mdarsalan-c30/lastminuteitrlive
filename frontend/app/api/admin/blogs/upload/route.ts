import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Prepare FormData for Cloudinary
    const cloudinaryData = new FormData();
    cloudinaryData.append("file", file);
    cloudinaryData.append("upload_preset", "LMITRBLOG"); // Unsigned preset from user
    cloudinaryData.append("folder", "LMTRBLOGS");

    // Upload to Cloudinary using REST API
    const cloudinaryRes = await fetch(
      "https://api.cloudinary.com/v1_1/g2ntyyz4/image/upload",
      {
        method: "POST",
        body: cloudinaryData,
      }
    );

    const data = await cloudinaryRes.json();

    if (!cloudinaryRes.ok) {
      console.error("Cloudinary error:", data);
      return NextResponse.json(
        { error: data.error?.message || "Cloudinary upload failed" },
        { status: cloudinaryRes.status }
      );
    }

    // Return the secure URL from Cloudinary
    const url = data.secure_url;

    return NextResponse.json({ success: true, url });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}


import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { cloudinary } from "@/lib/cloudinary";

const MAX_SIZE = 3 * 1024 * 1024; // 3 MB
const ALLOWED  = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif", "image/svg+xml"];

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let formData: FormData;
  try { formData = await req.formData(); }
  catch { return NextResponse.json({ error: "Invalid form data" }, { status: 400 }); }

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0)
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  if (!ALLOWED.includes(file.type))
    return NextResponse.json({ error: "Only JPG, PNG, WebP, GIF, or SVG allowed" }, { status: 400 });
  if (file.size > MAX_SIZE)
    return NextResponse.json({ error: "File too large — max 3 MB" }, { status: 400 });

  const bytes  = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Upload to Cloudinary — unique per user per upload (timestamp-based public_id)
  const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder:         "violink/link-icons",
        public_id:      `${session.userId}_${Date.now()}`,
        overwrite:      false,
        transformation: [
          { width: 256, height: 256, crop: "fill", gravity: "center" },
          { quality: "auto", fetch_format: "auto" },
        ],
      },
      (err, result) => {
        if (err || !result) return reject(err ?? new Error("Upload failed"));
        resolve(result as { secure_url: string });
      }
    ).end(buffer);
  });

  return NextResponse.json({ url: result.secure_url });
}

export const maxDuration = 30;

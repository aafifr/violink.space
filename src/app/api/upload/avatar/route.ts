import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { cloudinary } from "@/lib/cloudinary";

const MAX_SIZE   = 5 * 1024 * 1024; // 5 MB
const ALLOWED    = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let formData: FormData;
  try { formData = await req.formData(); }
  catch { return NextResponse.json({ error: "Invalid form data" }, { status: 400 }); }

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return NextResponse.json({ error: "No file provided" }, { status: 400 });
  if (!ALLOWED.includes(file.type)) return NextResponse.json({ error: "Only JPG, PNG, WebP, or GIF allowed" }, { status: 400 });
  if (file.size > MAX_SIZE) return NextResponse.json({ error: "File too large — max 5 MB" }, { status: 400 });

  const bytes  = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Upload to Cloudinary — one file per user (public_id is userId, overwrites automatically)
  const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder:          "violink/avatars",
        public_id:       session.userId,
        overwrite:       true,
        transformation:  [{ width: 400, height: 400, crop: "fill", quality: "auto", fetch_format: "auto" }],
      },
      (err, result) => {
        if (err || !result) return reject(err ?? new Error("Upload failed"));
        resolve(result as { secure_url: string });
      }
    ).end(buffer);
  });

  await prisma.profile.update({
    where: { userId: session.userId },
    data:  { avatar: result.secure_url },
  });

  return NextResponse.json({ url: result.secure_url });
}

export const maxDuration = 30;

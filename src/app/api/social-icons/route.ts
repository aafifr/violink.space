import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await prisma.profile.findUnique({ where: { userId: session.userId } });
  if (!profile) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const icons = await prisma.socialIcon.findMany({
    where: { profileId: profile.id },
    orderBy: { position: "asc" },
  });
  return NextResponse.json({ icons });
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await prisma.profile.findUnique({ where: { userId: session.userId } });
  if (!profile) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Max 5 social icons
  const count = await prisma.socialIcon.count({ where: { profileId: profile.id } });
  if (count >= 5) return NextResponse.json({ error: "Max 5 social icons allowed" }, { status: 400 });

  const { platform, url } = await req.json();
  if (!platform || !url) return NextResponse.json({ error: "platform and url required" }, { status: 400 });

  // Prevent duplicate platform
  const existing = await prisma.socialIcon.findFirst({ where: { profileId: profile.id, platform } });
  if (existing) return NextResponse.json({ error: "Platform already added" }, { status: 409 });

  const icon = await prisma.socialIcon.create({
    data: { profileId: profile.id, platform, url, position: count, active: true },
  });
  return NextResponse.json({ icon }, { status: 201 });
}

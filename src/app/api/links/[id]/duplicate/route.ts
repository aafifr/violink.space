import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await prisma.profile.findUnique({ where: { userId: session.userId } });
  if (!profile) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const original = await prisma.link.findFirst({ where: { id, profileId: profile.id } });
  if (!original) return NextResponse.json({ error: "Link not found" }, { status: 404 });

  const count = await prisma.link.count({ where: { profileId: profile.id } });
  const duplicate = await prisma.link.create({
    data: {
      profileId: profile.id,
      title: `${original.title} (copy)`,
      url: original.url,
      icon: original.icon,
      badge: original.badge,
      active: false, // duplicates start hidden
      featured: false,
      position: count,
    },
  });

  return NextResponse.json({ link: duplicate }, { status: 201 });
}

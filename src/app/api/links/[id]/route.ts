import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function getLink(req: NextRequest, id: string) {
  const session = await getSessionFromRequest(req);
  if (!session) return null;
  const profile = await prisma.profile.findUnique({ where: { userId: session.userId } });
  if (!profile) return null;
  return prisma.link.findFirst({ where: { id, profileId: profile.id } });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const link = await getLink(req, id);
  if (!link) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const { title, url, active, featured, badge, icon } = body;

  // If setting featured=true, unfeature others first
  if (featured === true) {
    await prisma.link.updateMany({ where: { profileId: link.profileId }, data: { featured: false } });
  }

  const updated = await prisma.link.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(url !== undefined && { url }),
      ...(active !== undefined && { active }),
      ...(featured !== undefined && { featured }),
      ...(badge !== undefined && { badge: badge || null }),
      ...(icon !== undefined && { icon: icon || null }),
    },
  });
  return NextResponse.json({ link: updated });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const link = await getLink(req, id);
  if (!link) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.link.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

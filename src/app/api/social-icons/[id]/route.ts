import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function getOwnedIcon(session: { userId: string }, id: string) {
  const profile = await prisma.profile.findUnique({ where: { userId: session.userId } });
  if (!profile) return null;
  const icon = await prisma.socialIcon.findFirst({ where: { id, profileId: profile.id } });
  return icon;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const icon = await getOwnedIcon(session, id);
  if (!icon) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (body.url      !== undefined) data.url    = body.url;
  if (body.active   !== undefined) data.active = body.active;
  if (body.position !== undefined) data.position = body.position;

  const updated = await prisma.socialIcon.update({ where: { id }, data });
  return NextResponse.json({ icon: updated });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(_req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const icon = await getOwnedIcon(session, id);
  if (!icon) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.socialIcon.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

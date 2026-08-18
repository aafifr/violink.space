import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const profile = await prisma.profile.findUnique({ where: { userId: session.userId } });
  if (!profile) return NextResponse.json({ links: [] });
  const links = await prisma.link.findMany({ where: { profileId: profile.id }, orderBy: { position: "asc" } });
  return NextResponse.json({ links });
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { title, url, icon, badge } = body;
    const linkType: string = body.type ?? "LINK";
    const isHeader = linkType === "HEADER";

    const profile = await prisma.profile.findUnique({ where: { userId: session.userId } });
    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    const totalCount = await prisma.link.count({ where: { profileId: profile.id } });

    // Determine if this new LINK should be featured (only if no other LINK exists)
    let shouldBeFeatured = false;
    if (!isHeader) {
      const realLinkCount = await prisma.link.count({ where: { profileId: profile.id, type: "LINK" } });
      shouldBeFeatured = realLinkCount === 0;
    }

    const link = await prisma.link.create({
      data: {
        profileId: profile.id,
        title: title ?? (isHeader ? "New Section" : "New Link"),
        url: isHeader ? "" : (url ?? ""),
        position: totalCount,
        featured: shouldBeFeatured,
        active: true,
        icon: isHeader ? null : (icon ?? null),
        badge: isHeader ? null : (badge ?? null),
        type: linkType,
      },
    });

    return NextResponse.json({ link }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[POST /api/links] error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}


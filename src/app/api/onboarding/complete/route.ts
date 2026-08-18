import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, bio, slug, theme, firstLink } = await req.json();

  if (!name || !slug) return NextResponse.json({ error: "Name and slug are required" }, { status: 400 });

  const cleanSlug = slugify(slug);
  const existing = await prisma.profile.findUnique({ where: { slug: cleanSlug } });
  if (existing) return NextResponse.json({ error: "Slug already taken" }, { status: 409 });

  // Check user doesn't already have profile
  const existingProfile = await prisma.profile.findUnique({ where: { userId: session.userId } });
  if (existingProfile) {
    // Update existing
    await prisma.profile.update({
      where: { userId: session.userId },
      data: { name, bio: bio || "", slug: cleanSlug, theme: theme || "matcha", onboarded: true },
    });
  } else {
    // Create new profile
    const profile = await prisma.profile.create({
      data: {
        userId: session.userId,
        name, bio: bio || "",
        slug: cleanSlug,
        theme: theme || "matcha",
        onboarded: true,
      },
    });

    // Add first link
    if (firstLink?.title && firstLink?.url) {
      await prisma.link.create({
        data: {
          profileId: profile.id,
          title: firstLink.title,
          url: firstLink.url.replace(/^https?:\/\//, ""),
          featured: true, active: true, position: 0,
        },
      });
    }
  }

  return NextResponse.json({ success: true });
}

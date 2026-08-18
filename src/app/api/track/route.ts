import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { todayStr } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { linkId, profileId } = body;
    if (!linkId || !profileId) return NextResponse.json({ ok: true });

    const today = todayStr();
    // Increment link clicks
    await prisma.link.update({ where: { id: linkId }, data: { clicks: { increment: 1 } } });
    // Increment daily analytics clicks
    await prisma.analytics.upsert({
      where:  { profileId_date: { profileId, date: today } },
      create: { profileId, date: today, views: 0, clicks: 1 },
      update: { clicks: { increment: 1 } },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true }); // silently fail - tracking is non-critical
  }
}

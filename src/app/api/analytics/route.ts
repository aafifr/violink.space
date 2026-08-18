import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const range = req.nextUrl.searchParams.get("range") ?? "30";

  const profile = await prisma.profile.findUnique({
    where: { userId: session.userId },
    include: {
      links: { orderBy: { clicks: "desc" } },
      analytics: { orderBy: { date: "asc" } },
    },
  });
  if (!profile) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Build date range
  let analyticsData = profile.analytics;
  let days: string[] = [];

  const today = new Date();
  const dayCount = range === "7" ? 7 : range === "30" ? 30 : range === "90" ? 90 : null;

  if (dayCount) {
    const cutoff = new Date();
    cutoff.setDate(today.getDate() - (dayCount - 1));
    const cutoffStr = cutoff.toISOString().slice(0, 10);
    analyticsData = profile.analytics.filter(a => a.date >= cutoffStr);

    for (let i = dayCount - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      days.push(d.toISOString().slice(0, 10));
    }
  } else {
    // "all" — use actual data range
    if (analyticsData.length > 0) {
      const first = analyticsData[0].date;
      const d = new Date(first + "T12:00:00");
      const end = new Date();
      while (d <= end) {
        days.push(d.toISOString().slice(0, 10));
        d.setDate(d.getDate() + 1);
      }
    } else {
      // No data — show last 30 days as empty
      for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        days.push(d.toISOString().slice(0, 10));
      }
    }
  }

  // Day-of-week buckets using the filtered data
  const dowBuckets = [0,1,2,3,4,5,6].map(dow => {
    const entries = analyticsData.filter(a => new Date(a.date + "T12:00:00").getDay() === dow);
    return { dow, total: entries.reduce((s, a) => s + a.views, 0) };
  });

  const byDate = Object.fromEntries(analyticsData.map(a => [a.date, { views: a.views, clicks: a.clicks }]));

  const totalViews  = analyticsData.reduce((s, a) => s + a.views, 0);
  const totalClicks = analyticsData.reduce((s, a) => s + a.clicks, 0);
  const ctr         = totalViews > 0 ? Number(((totalClicks / totalViews) * 100).toFixed(1)) : 0;

  return NextResponse.json({
    days,
    byDate,
    dowBuckets,
    totalViews,
    totalClicks,
    ctr,
    links: profile.links,
    totalLinks: profile.links.length,
    activeLinks: profile.links.filter(l => l.active).length,
  });
}

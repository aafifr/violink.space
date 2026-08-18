import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug) return NextResponse.json({ available: false });
  const existing = await prisma.profile.findUnique({ where: { slug }, select: { id: true } });
  return NextResponse.json({ available: !existing });
}

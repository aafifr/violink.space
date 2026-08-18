import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { order } = await req.json() as { order: { id: string; position: number }[] };
  await Promise.all(
    order.map(item => prisma.link.update({ where: { id: item.id }, data: { position: item.position } }))
  );
  return NextResponse.json({ success: true });
}

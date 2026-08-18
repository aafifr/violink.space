import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { signToken, createSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    if (password.length < 8) return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return NextResponse.json({ error: "Email already registered" }, { status: 409 });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({ data: { email, passwordHash } });

    const token = await signToken({ userId: user.id, email: user.email });
    const res = NextResponse.json({ success: true, onboarded: false });
    const cookie = createSessionCookie(token);
    res.cookies.set(cookie.name, cookie.value, cookie);
    return res;
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e?.message || "Internal server error" }, { status: 500 });
  }
}

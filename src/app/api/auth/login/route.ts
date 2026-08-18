import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { signToken, createSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) return NextResponse.json({ error: "Email and password required" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email }, include: { profile: true } });
    if (!user) return NextResponse.json({ error: "No account found with that email" }, { status: 401 });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return NextResponse.json({ error: "Incorrect password" }, { status: 401 });

    const token = await signToken({ userId: user.id, email: user.email });
    const res = NextResponse.json({ success: true, onboarded: user.profile?.onboarded ?? false });
    const cookie = createSessionCookie(token);
    res.cookies.set(cookie.name, cookie.value, cookie);
    return res;
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e?.message || "Internal server error" }, { status: 500 });
  }
}

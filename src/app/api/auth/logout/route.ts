import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth";

export async function DELETE() {
  const res = NextResponse.json({ success: true });
  const cookie = clearSessionCookie();
  res.cookies.set(cookie.name, cookie.value, { maxAge: 0, path: "/" });
  return res;
}

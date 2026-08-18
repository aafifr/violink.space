import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { BG_TYPES, VALID_GRADIENT_KEYS } from "@/lib/backgrounds";

/** Valid theme IDs for public profile pages */
const VALID_THEMES = new Set([
  "default", "clean-dark", "aurora", "frosted-rose",
  "neobrutalism", "retro-pop", "midnight", "forest",
]);

/** Legacy accent-only themes map to "default" */
const LEGACY_THEME_MAP: Record<string, string> = {
  matcha: "default", indigo: "default", slate: "default",
  crimson: "default", amber: "default", emerald: "default", rose: "default",
};

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const profile = await prisma.profile.findUnique({ where: { userId: session.userId } });
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  return NextResponse.json(profile);
}

export async function PATCH(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { 
    name, bio, slug, theme, avatar, bgType, bgValue, bgOverlay, bgEffect, bgPattern,
    btnStyle, btnRadius, btnColor, btnTextColor, fontFamily, fontColor 
  } = await req.json();

  if (slug) {
    const existing = await prisma.profile.findFirst({ where: { slug, NOT: { userId: session.userId } } });
    if (existing) return NextResponse.json({ error: "Slug already taken" }, { status: 409 });
  }

  // ── Validate theme ──────────────────────────────────────────────────────────
  let resolvedTheme: string | undefined;
  if (theme !== undefined && theme) {
    const mapped = LEGACY_THEME_MAP[theme] ?? theme;
    if (!VALID_THEMES.has(mapped)) return NextResponse.json({ error: `Invalid theme: "${theme}"` }, { status: 400 });
    resolvedTheme = mapped;
  }

  // ── Validate bgType / bgValue / bgOverlay ───────────────────────────────────
  let resolvedBgType: string | undefined;
  let resolvedBgValue: string | null | undefined;
  let resolvedBgOverlay: number | undefined;

  if (bgType !== undefined) {
    if (!BG_TYPES.includes(bgType)) return NextResponse.json({ error: `Invalid bgType: "${bgType}"` }, { status: 400 });
    resolvedBgType = bgType;

    if (bgType === "gradient") {
      if (!bgValue || !VALID_GRADIENT_KEYS.has(bgValue))
        return NextResponse.json({ error: `Invalid gradient key: "${bgValue}"` }, { status: 400 });
      resolvedBgValue = bgValue;
    } else if (bgType === "solid") {
      if (!bgValue || !/^#[0-9A-Fa-f]{6}$/.test(bgValue))
        return NextResponse.json({ error: "Invalid hex color" }, { status: 400 });
      resolvedBgValue = bgValue;
    } else if (bgType === "image") {
      resolvedBgValue = bgValue ?? null;
    } else if (bgType === "custom-gradient") {
      // Store the CSS gradient string directly
      resolvedBgValue = bgValue ?? null;
    } else {
      // "default" — clear value
      resolvedBgValue = null;
    }
  }

  if (bgValue !== undefined && resolvedBgValue === undefined) {
    resolvedBgValue = bgValue ?? null;
  }

  if (bgOverlay !== undefined) {
    const clamped = Math.max(-0.7, Math.min(0.7, Number(bgOverlay)));
    if (!isNaN(clamped)) resolvedBgOverlay = clamped;
  }

  const profile = await prisma.profile.update({
    where: { userId: session.userId },
    data: {
      ...(name               !== undefined && { name }),
      ...(bio                !== undefined && { bio }),
      ...(slug               !== undefined && slug && { slug }),
      ...(resolvedTheme      !== undefined && { theme: resolvedTheme }),
      ...(avatar             !== undefined && { avatar: avatar ?? null }),
      ...(resolvedBgType     !== undefined && { bgType: resolvedBgType }),
      ...(resolvedBgValue    !== undefined && { bgValue: resolvedBgValue }),
      ...(resolvedBgOverlay  !== undefined && { bgOverlay: resolvedBgOverlay }),
      ...(bgEffect           !== undefined ? { bgEffect } : {}),
      ...(bgPattern          !== undefined ? { bgPattern } : {}),
      // Button fields — must use explicit object to correctly pass null
      ...(btnStyle     !== undefined ? { btnStyle }     : {}),
      ...(btnRadius    !== undefined ? { btnRadius }    : {}),
      ...(btnColor     !== undefined ? { btnColor: btnColor ?? null }     : {}),
      ...(btnTextColor !== undefined ? { btnTextColor: btnTextColor ?? null } : {}),
      // Text / font fields
      ...(fontFamily   !== undefined ? { fontFamily }   : {}),
      ...(fontColor    !== undefined ? { fontColor: fontColor ?? null }   : {}),
    },
  });
  return NextResponse.json(profile);
}

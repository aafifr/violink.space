// Platform definitions for social shortcuts and link icons
// Uses real brand SVGs from /images/icon-sosial/ where available

export interface Platform {
  id: string;
  label: string;
  prefix: string;
  color: string;
  bg: string;
  hasBrandIcon: boolean; // true = has file in /images/icon-sosial/
}

export const PLATFORMS: Platform[] = [
  { id: "instagram", label: "Instagram", prefix: "instagram.com/",        color: "#c13584", bg: "rgba(193,53,132,0.10)", hasBrandIcon: true },
  { id: "tiktok",    label: "TikTok",    prefix: "tiktok.com/@",          color: "#111",    bg: "rgba(17,17,17,0.07)",  hasBrandIcon: true },
  { id: "youtube",   label: "YouTube",   prefix: "youtube.com/@",         color: "#c4302b", bg: "rgba(196,48,43,0.10)", hasBrandIcon: true },
  { id: "x",         label: "X / Twitter", prefix: "x.com/",             color: "#111",    bg: "rgba(17,17,17,0.07)",  hasBrandIcon: true },
  { id: "spotify",   label: "Spotify",   prefix: "open.spotify.com/",     color: "#1aa34a", bg: "rgba(26,163,74,0.10)", hasBrandIcon: true },
  { id: "linkedin",  label: "LinkedIn",  prefix: "linkedin.com/in/",      color: "#0a66c2", bg: "rgba(10,102,194,0.10)",hasBrandIcon: true },
  { id: "facebook",  label: "Facebook",  prefix: "facebook.com/",         color: "#1877f2", bg: "rgba(24,119,242,0.10)",hasBrandIcon: true },
  { id: "threads",   label: "Threads",   prefix: "threads.net/@",         color: "#111",    bg: "rgba(17,17,17,0.07)",  hasBrandIcon: true },
  { id: "github",    label: "GitHub",    prefix: "github.com/",            color: "#1B1F23", bg: "rgba(27,31,35,0.08)",   hasBrandIcon: true },
  { id: "pinterest", label: "Pinterest", prefix: "pinterest.com/",        color: "#e60023", bg: "rgba(230,0,35,0.09)",  hasBrandIcon: true },
  { id: "snapchat",  label: "Snapchat",  prefix: "snapchat.com/add/",     color: "#b89c00", bg: "rgba(255,220,0,0.14)", hasBrandIcon: true },
  { id: "discord",   label: "Discord",   prefix: "discord.gg/",           color: "#5865f2", bg: "rgba(88,101,242,0.10)",hasBrandIcon: true },
  { id: "whatsapp",  label: "WhatsApp",  prefix: "wa.me/",                color: "#128c7e", bg: "rgba(18,140,126,0.10)",hasBrandIcon: true },
  { id: "email",     label: "Email",     prefix: "mailto:",               color: "#061492", bg: "rgba(6,20,146,0.10)",  hasBrandIcon: true },
  { id: "website",   label: "Website",   prefix: "",                      color: "#667067", bg: "rgba(102,112,103,0.10)",hasBrandIcon: false },
];

export const PLATFORM_MAP = new Map(PLATFORMS.map(p => [p.id, p]));

export const BADGES = [
  { id: "new",     label: "New",     emoji: "✦",  color: "#0a66c2", bg: "rgba(10,102,194,0.10)" },
  { id: "hot",     label: "Hot",     emoji: "↑",  color: "#c4302b", bg: "rgba(196,48,43,0.10)"  },
  { id: "sale",    label: "Sale",    emoji: "%",   color: "#1aa34a", bg: "rgba(26,163,74,0.10)"  },
  { id: "event",   label: "Event",   emoji: "◈",  color: "#c13584", bg: "rgba(193,53,132,0.10)" },
  { id: "limited", label: "Limited", emoji: "◷",  color: "#b89c00", bg: "rgba(180,155,0,0.12)"  },
] as const;

export type BadgeId = typeof BADGES[number]["id"];

export function getBadge(id: string | null | undefined) {
  return BADGES.find(b => b.id === id) ?? null;
}

export function getPlatform(id: string | null | undefined) {
  if (!id) return null;
  return PLATFORM_MAP.get(id) ?? null;
}

/**
 * Shared background system — used by both server (public page) and client (dashboard).
 */
import type { CSSProperties } from "react";

// ─── GRADIENT PRESETS ────────────────────────────────────────────────────────
export type GradientKey =
  | "sunset" | "ocean" | "dusk" | "aurora-borealis"
  | "peach" | "lavender" | "charcoal" | "midnight-blue"
  | "forest-deep" | "rose-gold" | "citrus" | "slate-sky"
  // Animated presets
  | "anim-aurora" | "anim-sunset" | "anim-ocean" | "anim-candy" | "anim-neon";

export const GRADIENTS: Record<GradientKey, {
  css: string;
  label: string;
  from: string;
  to: string;
  animated?: boolean;
  /** CSS class applied to .page for animated variants */
  animClass?: string;
}> = {
  // ── Static presets ──────────────────────────────────────────────────────
  sunset:         { css: "linear-gradient(135deg,#FF6B35 0%,#F7C59F 50%,#EFEFD0 100%)", label: "Sunset",         from: "#FF6B35", to: "#EFEFD0" },
  ocean:          { css: "linear-gradient(135deg,#0077B6 0%,#00B4D8 50%,#90E0EF 100%)", label: "Ocean",          from: "#0077B6", to: "#90E0EF" },
  dusk:           { css: "linear-gradient(135deg,#2D1B69 0%,#7B2D8B 50%,#E95F8A 100%)", label: "Dusk",           from: "#2D1B69", to: "#E95F8A" },
  "aurora-borealis": { css: "linear-gradient(135deg,#0D1B2A 0%,#1B4332 40%,#52B788 100%)", label: "Aurora",      from: "#0D1B2A", to: "#52B788" },
  peach:          { css: "linear-gradient(135deg,#FFCBA4 0%,#FF8B8B 100%)",              label: "Peach",          from: "#FFCBA4", to: "#FF8B8B" },
  lavender:       { css: "linear-gradient(135deg,#E8D5FF 0%,#B39DDB 50%,#7B68EE 100%)", label: "Lavender",       from: "#E8D5FF", to: "#7B68EE" },
  charcoal:       { css: "linear-gradient(135deg,#1C1C1E 0%,#2C2C2E 50%,#3A3A3C 100%)", label: "Charcoal",       from: "#1C1C1E", to: "#3A3A3C" },
  "midnight-blue":{ css: "linear-gradient(135deg,#0A0A1A 0%,#1A1A3A 50%,#2D2D6B 100%)", label: "Midnight",       from: "#0A0A1A", to: "#2D2D6B" },
  "forest-deep":  { css: "linear-gradient(135deg,#0A1A0A 0%,#1A3A1A 50%,#2D6B2D 100%)", label: "Forest Deep",    from: "#0A1A0A", to: "#2D6B2D" },
  "rose-gold":    { css: "linear-gradient(135deg,#F8EDEB 0%,#E8A598 50%,#C9625F 100%)", label: "Rose Gold",       from: "#F8EDEB", to: "#C9625F" },
  citrus:         { css: "linear-gradient(135deg,#FFF176 0%,#FFCA28 50%,#FF8F00 100%)", label: "Citrus",          from: "#FFF176", to: "#FF8F00" },
  "slate-sky":    { css: "linear-gradient(135deg,#CFD8DC 0%,#78909C 50%,#37474F 100%)", label: "Slate Sky",       from: "#CFD8DC", to: "#37474F" },

  // ── Animated presets ─────────────────────────────────────────────────────
  "anim-aurora":  {
    css: "linear-gradient(135deg,#1E1040,#0D1B4B,#1B4332,#7C3AED,#1E1040)",
    label: "Aurora Live",
    from: "#1E1040", to: "#7C3AED",
    animated: true, animClass: "bg-anim-aurora",
  },
  "anim-sunset":  {
    css: "linear-gradient(135deg,#FF6B35,#F7C59F,#E95F8A,#FF6B35)",
    label: "Sunset Live",
    from: "#FF6B35", to: "#E95F8A",
    animated: true, animClass: "bg-anim-sunset",
  },
  "anim-ocean":   {
    css: "linear-gradient(135deg,#0077B6,#00B4D8,#0D1B2A,#0077B6)",
    label: "Ocean Live",
    from: "#0077B6", to: "#0D1B2A",
    animated: true, animClass: "bg-anim-ocean",
  },
  "anim-candy":   {
    css: "linear-gradient(135deg,#FF6EB4,#FF9A8B,#FFEAA7,#74B9FF,#FF6EB4)",
    label: "Candy Live",
    from: "#FF6EB4", to: "#74B9FF",
    animated: true, animClass: "bg-anim-candy",
  },
  "anim-neon":    {
    css: "linear-gradient(135deg,#0A0A0A,#7C3AED,#06B6D4,#0A0A0A)",
    label: "Neon Live",
    from: "#0A0A0A", to: "#06B6D4",
    animated: true, animClass: "bg-anim-neon",
  },
};

export const ANIMATED_GRADIENT_KEYS = new Set(
  Object.entries(GRADIENTS)
    .filter(([, v]) => v.animated)
    .map(([k]) => k)
);

// ─── SOLID COLOR PRESETS ──────────────────────────────────────────────────────
export const SOLID_COLORS: { hex: string; label: string }[] = [
  { hex: "#FFFFFF", label: "White" },
  { hex: "#F5F5F0", label: "Ivory" },
  { hex: "#F3F4F6", label: "Smoke" },
  { hex: "#E5E7EB", label: "Silver" },
  { hex: "#1C1C1E", label: "Onyx" },
  { hex: "#0A0A0B", label: "Black" },
  { hex: "#0A0C12", label: "Deep Navy" },
  { hex: "#0D1A0D", label: "Deep Forest" },
  { hex: "#1A0A2E", label: "Indigo Night" },
  { hex: "#2D0A1E", label: "Merlot" },
  { hex: "#FAF0A0", label: "Cream Yellow" },
  { hex: "#FF4500", label: "Flame" },
  { hex: "#1B4332", label: "Sage" },
  { hex: "#7B2D8B", label: "Plum" },
  { hex: "#0077B6", label: "Cobalt" },
  { hex: "#C9625F", label: "Terracotta" },
];

// ─── PATTERN PRESETS ──────────────────────────────────────────────────────────
export type PatternKey = "none" | "dots" | "grid" | "diagonal" | "noise";

export const PATTERNS: Record<PatternKey, { label: string; icon: string; css?: string }> = {
  none:     { label: "None",     icon: "✕" },
  dots:     { label: "Dots",     icon: "⠿", css: `radial-gradient(circle, rgba(255,255,255,0.25) 1px, transparent 1px)` },
  grid:     { label: "Grid",     icon: "⊞", css: `linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)` },
  diagonal: { label: "Lines",    icon: "╱", css: `repeating-linear-gradient(45deg, rgba(255,255,255,0.10) 0px, rgba(255,255,255,0.10) 1px, transparent 1px, transparent 12px)` },
  noise:    { label: "Noise",    icon: "▒" },
};

/** Returns inline style for a pattern overlay. Applied as additional background-image layer. */
export function computePatternStyle(pattern: PatternKey): CSSProperties {
  if (pattern === "none") return {};
  if (pattern === "noise") {
    // SVG-based noise rendered as background-image
    const svgNoise = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E")`;
    return { backgroundImage: svgNoise, backgroundRepeat: "repeat", backgroundSize: "200px 200px" };
  }
  const p = PATTERNS[pattern];
  if (!p.css) return {};
  const sizeMap: Record<string, string> = {
    dots: "18px 18px",
    grid: "24px 24px",
    diagonal: "14px 14px",
  };
  return {
    backgroundImage: p.css,
    backgroundSize: sizeMap[pattern] ?? "20px 20px",
  };
}

// ─── VALID TYPES ─────────────────────────────────────────────────────────────
export const BG_TYPES = ["default", "solid", "gradient", "image", "custom-gradient"] as const;
export type BgType = typeof BG_TYPES[number];

export const VALID_GRADIENT_KEYS = new Set(Object.keys(GRADIENTS));

// ─── COMPUTE INLINE STYLE ────────────────────────────────────────────────────
/**
 * Returns a React CSSProperties object for the page background.
 * Used on the public [slug]/page.tsx (server-side, no CSS vars needed).
 */
export function computeBgStyle(
  bgType: string,
  bgValue: string | null | undefined,
  bgOverlay: number | null | undefined,
): CSSProperties {
  const overlay = bgOverlay ?? 0;

  if (bgType === "solid" && bgValue) {
    return { background: bgValue };
  }

  if (bgType === "custom-gradient" && bgValue) {
    return { background: bgValue };
  }

  if (bgType === "gradient" && bgValue && VALID_GRADIENT_KEYS.has(bgValue)) {
    const g = GRADIENTS[bgValue as GradientKey];
    // For animated gradients, return the fallback static CSS (animation is applied via className)
    return { background: g.css };
  }

  if (bgType === "image" && bgValue) {
    const isLight = overlay < 0;
    const absOverlay = Math.abs(overlay);
    const overlayColor = isLight
      ? `rgba(255,255,255,${absOverlay.toFixed(2)})`
      : `rgba(0,0,0,${absOverlay.toFixed(2)})`;

    return {
      backgroundImage: `linear-gradient(${overlayColor},${overlayColor}), url(${bgValue})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    };
  }

  // "default" → let CSS variable from theme handle it
  return {};
}

// ─── SMART AUTO-CONTRAST ─────────────────────────────────────────────────────
export function getOptimalTextColor(
  bgType: string,
  bgValue: string | null | undefined,
  bgOverlay: number | null | undefined,
): string | undefined {
  if (bgType === "solid" && bgValue) {
    const h = bgValue.replace('#', '');
    if (h.length === 6) {
      const r = parseInt(h.substring(0, 2), 16);
      const g = parseInt(h.substring(2, 4), 16);
      const b = parseInt(h.substring(4, 6), 16);
      const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      return luma < 128 ? "#FFFFFF" : "#0A0A0B";
    }
  }

  if ((bgType === "gradient" || bgType === "custom-gradient") && bgValue) {
    if (VALID_GRADIENT_KEYS.has(bgValue)) {
      const darkGradients = ["dusk", "aurora-borealis", "charcoal", "midnight-blue", "forest-deep", "slate-sky",
        "anim-aurora", "anim-ocean", "anim-neon"];
      return darkGradients.includes(bgValue) ? "#FFFFFF" : "#0A0A0B";
    }
    // custom-gradient: try to detect from first color in CSS string
    const match = bgValue.match(/#([0-9a-fA-F]{6})/);
    if (match) {
      const r = parseInt(match[1].substring(0, 2), 16);
      const g = parseInt(match[1].substring(2, 4), 16);
      const b = parseInt(match[1].substring(4, 6), 16);
      const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      return luma < 128 ? "#FFFFFF" : "#0A0A0B";
    }
  }

  if (bgType === "image") {
    const overlay = bgOverlay ?? 0;
    if (overlay >= 0.15) return "#FFFFFF";
    if (overlay <= -0.15) return "#0A0A0B";
  }

  return undefined;
}

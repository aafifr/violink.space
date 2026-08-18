import { getPlatform } from "@/lib/platforms";

type IconProps = { size?: number; color?: string };

// Fallback SVG icons for platforms without brand assets (website)
function I({ size = 18, children }: { size?: number; color?: string; children: React.ReactNode }) {
  return <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden>{children}</svg>;
}

function WebsiteFallback({ size = 18, color = "currentColor" }: IconProps) {
  return <I size={size}><circle cx="10" cy="10" r="8" stroke={color} strokeWidth="1.6"/><path d="M2 10h16M10 2c-2 3-3 5-3 8s1 5 3 8M10 2c2 3 3 5 3 8s-1 5-3 8" stroke={color} strokeWidth="1.4" strokeLinecap="round"/></I>;
}

export function LinkDefaultIcon({ size = 18, color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M8.5 11.5a4 4 0 005.66 0l2-2a4 4 0 00-5.66-5.66L9 5.34" stroke={color} strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M11.5 8.5a4 4 0 00-5.66 0l-2 2a4 4 0 005.66 5.66L11 14.66" stroke={color} strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  );
}

/**
 * Renders the correct icon for a platform:
 * - Brand SVG image from /images/icon-sosial/ for official icons
 * - Fallback SVG for spotify, linkedin, website
 */
export function PlatformIcon({
  id,
  size = 18,
  color = "currentColor",
}: {
  id: string;
  size?: number;
  color?: string;
}) {
  const platform = getPlatform(id);

  if (platform?.hasBrandIcon) {
    const ext = id === "linkedin" ? "png" : "svg";
    return (
      <img
        src={`/images/icon-sosial/${id}-icon.${ext}`}
        alt={platform.label}
        width={size}
        height={size}
        style={{ display: "block", flexShrink: 0, objectFit: "cover", width: "100%", height: "100%" }}
        draggable={false}
      />
    );
  }

  // Fallback SVG for platforms without brand icon files
  return <WebsiteFallback size={size} color={color} />;
}

import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { initialsFromName } from "@/lib/utils";
import type { Metadata } from "next";
import styles from "./profile.module.css";
import { TrackedLink } from "./TrackedLink";
import { ShareButton } from "./ShareButton";
import { PlatformIcon } from "@/lib/PlatformIcon";
import { getPlatform } from "@/lib/platforms";
import { computeBgStyle, getOptimalTextColor, computePatternStyle, GRADIENTS, ANIMATED_GRADIENT_KEYS } from "@/lib/backgrounds";
import type { GradientKey, PatternKey } from "@/lib/backgrounds";
import { computeBtnStyle } from "@/lib/buttons";

interface Props { params: Promise<{ slug: string }> }

// Always fetch fresh data so button/text/background customisations appear immediately
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const profile = await prisma.profile.findUnique({ where: { slug }, select: { name:true, bio:true } });
  if (!profile) return { title: "Profile not found" };
  return {
    title: profile.name,
    description: profile.bio || `${profile.name}'s VioLink page`,
    openGraph: { title: profile.name, description: profile.bio || "", type:"profile" },
  };
}

export default async function PublicProfilePage({ params }: Props) {
  const { slug } = await params;

  const profile = await prisma.profile.findUnique({
    where: { slug },
    include: {
      links: { where:{ active:true }, orderBy:[{ featured:"desc" },{ position:"asc" }] },
      socialIcons: { where:{ active:true }, orderBy:{ position:"asc" } },
    },
  });

  if (!profile) notFound();

  // Track page view (fire-and-forget)
  const today = new Date().toISOString().slice(0, 10);
  prisma.analytics.upsert({
    where:   { profileId_date: { profileId: profile.id, date: today } },
    create:  { profileId: profile.id, date: today, views: 1, clicks: 0 },
    update:  { views: { increment: 1 } },
  }).catch(() => {});

  const initials = initialsFromName(profile.name);

  // Compute background styles
  const bgStyle          = computeBgStyle(profile.bgType, profile.bgValue, profile.bgOverlay);
  const optimalTextColor = getOptimalTextColor(profile.bgType, profile.bgValue, profile.bgOverlay);
  const btnStyle         = computeBtnStyle(profile.btnStyle, profile.btnRadius, profile.btnColor, profile.btnTextColor);

  // Always render image backgrounds as a separate fixed layer (NOT on .page div)
  // so that backdrop-filter on .link can reach it without stacking context interference.
  const hasImageBg = profile.bgType === "image" && !!profile.bgValue;
  const hasBlur    = hasImageBg && profile.bgEffect === "blur";

  // Detect animated gradient key to apply CSS class
  const isAnimatedGradient = profile.bgType === "gradient" && ANIMATED_GRADIENT_KEYS.has(profile.bgValue ?? "");
  const animGradientClass  = isAnimatedGradient
    ? GRADIENTS[profile.bgValue as GradientKey]?.animClass ?? ""
    : "";

  // Pattern overlay
  const bgPattern = (profile.bgPattern ?? "none") as PatternKey;
  const hasPattern = bgPattern !== "none";
  const patternStyle = computePatternStyle(bgPattern);

  const hasCustomBg = profile.bgType !== "default";

  // When custom background is set, render it as a position: fixed layer
  // so it stays fixed on screen (full viewport) while scrolling.
  const pageStyle = {
    ...btnStyle,
    ...(profile.fontFamily && profile.fontFamily !== "default" 
        ? { "--body": profile.fontFamily, "--display": profile.fontFamily } 
        : {}),
    ...(profile.fontColor 
        ? { "--pub-ink": profile.fontColor, "--adaptive-ink": profile.fontColor } 
        : optimalTextColor ? { "--adaptive-ink": optimalTextColor } : {})
  } as React.CSSProperties;

  const pageClass = [
    styles.page,
    hasCustomBg ? styles.customBgActive : "",
  ].filter(Boolean).join(" ");

  const fixedBgClass = isAnimatedGradient ? animGradientClass : "";

  return (
    <div className={pageClass} data-theme={profile.theme} style={pageStyle}>
      {/* Fixed background layer for all custom backgrounds (solid, gradient, image) */}
      {hasCustomBg && !hasBlur && (
        <div
          className={fixedBgClass}
          style={{
            position: "fixed", inset: 0, zIndex: 0,
            pointerEvents: "none",
            ...bgStyle,
          }}
          aria-hidden
        />
      )}

      {/* Blur background layer — only when bgEffect is 'blur' */}
      {hasBlur && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 0,
          pointerEvents: "none",
          backgroundImage: `url(${profile.bgValue})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          filter: "blur(20px)",
          transform: "scale(1.1)",
        }} aria-hidden />
      )}
      {/* Overlay for blur mode brightness control */}
      {hasBlur && profile.bgOverlay !== 0 && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 0,
          pointerEvents: "none",
          background: profile.bgOverlay > 0
            ? `rgba(0,0,0,${profile.bgOverlay.toFixed(2)})`
            : `rgba(255,255,255,${Math.abs(profile.bgOverlay).toFixed(2)})`,
        }} aria-hidden />
      )}
      {/* Pattern overlay layer — rendered above bg, below content */}
      {hasPattern && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 0,
          pointerEvents: "none",
          ...patternStyle,
        }} aria-hidden />
      )}
      {/* HEADER BAR (Share only) */}
      <div className={styles.headerButtons}>
        <ShareButton name={profile.name} slug={profile.slug} />
      </div>

      <article className={styles.card}>
        {/* AVATAR */}
        <div className={styles.avatarWrap}>
          {profile.avatar ? (
            <img
              src={profile.avatar}
              alt={`${profile.name}'s profile photo`}
              className={styles.avatarPhoto}
            />
          ) : (
            <div className={styles.avatarCore} aria-label={`${profile.name}'s initials`}>{initials}</div>
          )}
        </div>

        {/* IDENTITY */}
        <div className={styles.identity}>
          <h1 className={styles.name}>{profile.name}</h1>
          {profile.bio && <p className={styles.bio}>{profile.bio}</p>}
        </div>

        {/* SOCIAL ICONS ROW */}
        {profile.socialIcons.length > 0 && (
          <div className={styles.socialRow} role="list" aria-label="Social links">
            {profile.socialIcons.map(icon => {
              const p = getPlatform(icon.platform);
              return (
                <a
                  key={icon.id}
                  href={`https://${icon.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialIcon}
                  style={{ background: p?.hasBrandIcon ? "transparent" : (p?.bg ?? "rgba(102,112,103,0.12)") }}
                  title={p?.label ?? icon.platform}
                  aria-label={p?.label ?? icon.platform}
                  role="listitem">
                  <PlatformIcon id={icon.platform} size={p?.hasBrandIcon ? 36 : 20} color={p?.color ?? "currentColor"} />
                </a>
              );
            })}
          </div>
        )}

        {/* LINKS */}
        <nav className={styles.links} aria-label="Profile links">
          {profile.links.map((link, i) => {
            if (link.type === 'HEADER') {
              return (
                <h2 key={link.id} className={styles.linkGroupHeader}>
                  {link.title}
                </h2>
              );
            }
            return (
              <TrackedLink
                key={link.id}
                href={`https://${link.url}`}
                title={link.title}
                url={link.url}
                featured={link.featured}
                linkId={link.id}
                profileId={profile.id}
                icon={link.icon}
                badge={link.badge}
              />
            );
          })}
          {profile.links.length === 0 && (
            <div className={styles.noLinks}>No links added yet.</div>
          )}
        </nav>

        {/* FOOTER */}
        <footer className={styles.footer}>
          <span>Created with</span>
          <a href="/" className={styles.footerBrand}>VioLink Studio</a>
        </footer>
      </article>
    </div>
  );
}

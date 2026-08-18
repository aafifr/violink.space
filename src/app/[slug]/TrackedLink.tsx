"use client";
import styles from "./profile.module.css";
import { getPlatform } from "@/lib/platforms";
import { PlatformIcon, LinkDefaultIcon } from "@/lib/PlatformIcon";

interface TrackedLinkProps {
  href: string;
  title: string;
  url: string;
  featured: boolean;
  linkId: string;
  profileId: string;
  icon: string | null;
  badge: string | null;
}

export function TrackedLink({ href, title, linkId, profileId, icon }: TrackedLinkProps) {
  const handleClick = () => {
    try { navigator.sendBeacon?.("/api/track", JSON.stringify({ linkId, profileId })); } catch {}
  };

  const isUrl = icon?.startsWith("http");
  const platform = !isUrl ? getPlatform(icon) : null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className={styles.link}
      onClick={handleClick}
    >
      {/* ICON */}
      <span
        className={styles.linkIcon}
        style={{
          background: isUrl ? "#f5f5f5" : (platform?.hasBrandIcon ? "transparent" : (platform?.bg ?? "rgba(102,112,103,0.08)")),
          color: platform?.color ?? "var(--muted)"
        }}
      >
        {isUrl
          ? <img src={icon!} alt="" width={42} height={42} style={{ objectFit: "contain", width: 42, height: 42 }} onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
          : platform
            ? <PlatformIcon id={icon!} size={platform.hasBrandIcon ? 42 : 18} color={platform.color} />
            : <LinkDefaultIcon size={18} color="var(--muted)" />}
      </span>

      {/* TITLE — centered */}
      <span className={styles.linkTitle}>{title}</span>

      {/* ARROW */}
      <span className={styles.arrow} aria-hidden>
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
          <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </span>
    </a>
  );
}

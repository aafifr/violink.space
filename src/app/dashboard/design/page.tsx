"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./design.module.css";
import { GRADIENTS, type GradientKey } from "@/lib/backgrounds";

// ─── THEME label lookup (for the nav-card subtitle) ───────────────────────────
const THEME_LABELS: Record<string, string> = {
  "default":      "Clean White",
  "clean-dark":   "Slate Dark",
  "aurora":       "Aurora",
  "frosted-rose": "Frosted Rose",
  "neobrutalism": "Brutal Black",
  "retro-pop":    "Retro Pop",
  "midnight":     "Midnight",
  "forest":       "Forest",
};

// Mini 32×32 theme palette preview
function ThemeDot({ theme }: { theme: string }) {
  const DOTS: Record<string, string> = {
    "default":      "#4F46E5",
    "clean-dark":   "#818CF8",
    "aurora":       "#A78BFA",
    "frosted-rose": "#F472B6",
    "neobrutalism": "#0A0A0B",
    "retro-pop":    "#FFFFFF",
    "midnight":     "#8B5CF6",
    "forest":       "#4ADE80",
  };
  const BG: Record<string, string> = {
    "default":      "#F3F4F6",
    "clean-dark":   "#12141E",
    "aurora":       "#1E1040",
    "frosted-rose": "#2D0A1E",
    "neobrutalism": "#FAF0A0",
    "retro-pop":    "#FF4500",
    "midnight":     "#08080F",
    "forest":       "#091409",
  };
  return (
    <div className={styles.themeDot} style={{ background: BG[theme] ?? "#F3F4F6" }}>
      <div className={styles.themeDotAccent} style={{ background: DOTS[theme] ?? "#4F46E5" }} />
    </div>
  );
}

// Mini background preview (32×32)
function BgDot({ bgType, bgValue }: { bgType: string; bgValue: string }) {
  if (bgType === "gradient" && bgValue) {
    const g = GRADIENTS[bgValue as GradientKey];
    if (g) return <div className={styles.bgDot} style={{ background: g.css }} />;
  }
  if (bgType === "solid" && bgValue) {
    return <div className={styles.bgDot} style={{ background: bgValue }} />;
  }
  if (bgType === "image" && bgValue) {
    return <div className={styles.bgDot} style={{ backgroundImage: `url(${bgValue})`, backgroundSize: "cover", backgroundPosition: "center" }} />;
  }
  // default
  return (
    <div className={styles.bgDot} style={{ background: "#F3F4F6" }}>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ opacity: 0.35 }}>
        <rect x="1" y="1" width="12" height="12" rx="3" stroke="currentColor" strokeWidth="1.2"/>
        <path d="M1 5l3-3 3 3 3-3 3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    </div>
  );
}

export default function DesignIndexPage() {
  const [profile, setProfile] = useState<{
    theme: string; bgType: string; bgValue: string; btnStyle: string; fontFamily: string;
  } | null>(null);

  useEffect(() => {
    fetch("/api/profile").then(r => r.json()).then(d => {
      setProfile({
        theme:      d.theme      ?? "default",
        bgType:     d.bgType     ?? "default",
        bgValue:    d.bgValue    ?? "",
        btnStyle:   d.btnStyle   ?? "default",
        fontFamily: d.fontFamily ?? "default",
      });
    });
  }, []);

  const themeLabel = profile ? (THEME_LABELS[profile.theme] ?? "Default") : "—";
  const bgLabel =
    !profile               ? "—" :
    profile.bgType === "gradient" && profile.bgValue ? (GRADIENTS[profile.bgValue as GradientKey]?.label ?? "Gradient") :
    profile.bgType === "solid"    ? "Warna solid"  :
    profile.bgType === "image"    ? "Custom image" :
    "Default (dari tema)";

  return (
    <div className={styles.container}>
      <div className={styles.editorPane}>
        <header className={styles.pageHead}>
          <div>
            <p className="eyebrow">Design</p>
            <h1 className={styles.title}>Design</h1>
          </div>
        </header>

        {/* ── THEME NAV CARD ── */}
        <div className={styles.navGroup}>
          <Link href="/dashboard/design/theme" className={styles.navCard} id="design-nav-theme">
            <div className={styles.navCardLeft}>
              {profile
                ? <ThemeDot theme={profile.theme} />
                : <div className={styles.themeDot + " skeleton"} />
              }
              <div className={styles.navCardInfo}>
                <span className={styles.navCardTitle}>Theme</span>
                <span className={styles.navCardSub}>{themeLabel}</span>
              </div>
            </div>
            <svg className={styles.chevron} width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>

        {/* ── DIVIDER ── */}
        <div className={styles.dividerGroup}>
          <span className={styles.dividerLabel}>Customize</span>
        </div>

        {/* ── CUSTOMIZE NAV CARDS ── */}
        <div className={styles.navGroup}>
          <Link href="/dashboard/design/background" className={styles.navCard} id="design-nav-background">
            <div className={styles.navCardLeft}>
              {profile
                ? <BgDot bgType={profile.bgType} bgValue={profile.bgValue} />
                : <div className={styles.bgDot + " skeleton"} />
              }
              <div className={styles.navCardInfo}>
                <span className={styles.navCardTitle}>Background</span>
                <span className={styles.navCardSub}>{bgLabel}</span>
              </div>
            </div>
            <svg className={styles.chevron} width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>

          {/* ── BUTTONS ── */}
          <Link href="/dashboard/design/buttons" className={styles.navCard} id="design-nav-buttons">
            <div className={styles.navCardLeft}>
              <div className={styles.bgDot} style={{ background: "#F3F4F6", borderRadius: "4px" }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ opacity: 0.5 }}>
                  <rect x="2" y="4" width="10" height="6" rx="2" stroke="currentColor" strokeWidth="1.2"/>
                </svg>
              </div>
              <div className={styles.navCardInfo}>
                <span className={styles.navCardTitle}>Buttons</span>
                <span className={styles.navCardSub}>
                  {profile && profile.btnStyle !== "default" ? "Custom" : "Dari tema"}
                </span>
              </div>
            </div>
            <svg className={styles.chevron} width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>

          {/* ── TEXT ── */}
          <Link href="/dashboard/design/text" className={styles.navCard} id="design-nav-text">
            <div className={styles.navCardLeft}>
              <div className={styles.bgDot} style={{ background: "#F3F4F6", borderRadius: "4px" }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ opacity: 0.5 }}>
                  <path d="M3 11L7 3L11 11M4.5 8H9.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className={styles.navCardInfo}>
                <span className={styles.navCardTitle}>Text</span>
                <span className={styles.navCardSub}>
                  {profile && profile.fontFamily !== "default" ? "Custom" : "Dari tema"}
                </span>
              </div>
            </div>
            <svg className={styles.chevron} width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}

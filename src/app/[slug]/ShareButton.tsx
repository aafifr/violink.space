"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import styles from "./profile.module.css";

interface ShareButtonProps {
  name: string;
  slug: string;
}

/** Strip cache-busting / internal query params from URL */
function cleanUrl(raw: string): string {
  try {
    const u = new URL(raw);
    u.searchParams.delete("t");
    return u.toString();
  } catch {
    return raw;
  }
}

const SHARE_OPTIONS = [
  {
    id: "whatsapp",
    label: "WhatsApp",
    color: "#25D366",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" aria-hidden>
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.555 4.126 1.526 5.855L0 24l6.335-1.502A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.007-1.37l-.36-.214-3.76.892.946-3.648-.234-.375A9.818 9.818 0 1112 21.818z"/>
      </svg>
    ),
    getHref: (url: string, name: string) =>
      `https://wa.me/?text=${encodeURIComponent(`${name}'s VioLink — ${url}`)}`,
  },
  {
    id: "x",
    label: "X (Twitter)",
    color: "#000000",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.74l7.73-8.835L1.254 2.25H8.08l4.258 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/>
      </svg>
    ),
    getHref: (url: string, name: string) =>
      `https://x.com/intent/tweet?text=${encodeURIComponent(`Check out ${name}'s links!`)}&url=${encodeURIComponent(url)}`,
  },
  {
    id: "facebook",
    label: "Facebook",
    color: "#1877F2",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" aria-hidden>
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
    getHref: (url: string) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    id: "telegram",
    label: "Telegram",
    color: "#26A5E4",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" aria-hidden>
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
      </svg>
    ),
    getHref: (url: string, name: string) =>
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(`${name}'s VioLink`)}`,
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    color: "#0A66C2",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" aria-hidden>
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
    getHref: (url: string) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
] as const;

export function ShareButton({ name, slug }: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [profileUrl, setProfileUrl] = useState(`https://violink.space/${slug}`);
  const panelRef = useRef<HTMLDivElement>(null);
  const btnRef   = useRef<HTMLButtonElement>(null);

  // Resolve and clean URL client-side only
  useEffect(() => {
    setMounted(true);
    setProfileUrl(cleanUrl(window.location.href));
  }, []);

  // Refresh clean URL whenever the popup opens (handles iframe ?t= stamps)
  useEffect(() => {
    if (open && typeof window !== "undefined") {
      setProfileUrl(cleanUrl(window.location.href));
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      /* fallback: select a temp input */
      const inp = document.createElement("input");
      inp.value = profileUrl;
      document.body.appendChild(inp);
      inp.select();
      document.execCommand("copy");
      document.body.removeChild(inp);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  }, [profileUrl]);

  const displayUrl = profileUrl.replace(/^https?:\/\//, "");

  const modal = mounted ? createPortal(
    <>
      {/* Backdrop — click to close */}
      <div
        className={styles.shareBackdrop}
        onClick={() => setOpen(false)}
        aria-hidden
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={styles.sharePanel}
        role="dialog"
        aria-modal="true"
        aria-label="Bagikan profil"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag pill (mobile visual only) */}
        <div className={styles.sharePill} aria-hidden />

        {/* Header */}
        <div className={styles.sharePanelHeader}>
          <span className={styles.sharePanelTitle}>Bagikan profil</span>
          <button
            className={styles.sharePanelClose}
            onClick={() => setOpen(false)}
            aria-label="Tutup"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Profile preview card */}
        <div className={styles.sharePreviewCard}>
          <span className={styles.sharePreviewName}>{name}</span>
          <span className={styles.sharePreviewUrl}>{displayUrl}</span>
        </div>

        {/* Social icons row */}
        <div className={styles.shareSocialRow} role="list">

          {/* Copy link */}
          <button
            className={styles.shareSocialItem}
            onClick={handleCopy}
            aria-label="Salin tautan"
            role="listitem"
          >
            <span
              className={styles.shareSocialIcon}
              style={{
                background: copied ? "var(--success-soft)" : "var(--bg-strong)",
                color: copied ? "var(--success)" : "var(--ink-2)",
              }}
            >
              {copied ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                </svg>
              )}
            </span>
            <span className={styles.shareSocialLabel}>{copied ? "Tersalin!" : "Salin tautan"}</span>
          </button>

          {/* Social platform links */}
          {SHARE_OPTIONS.map(opt => (
            <a
              key={opt.id}
              href={opt.getHref(profileUrl, name)}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.shareSocialItem}
              aria-label={`Bagikan ke ${opt.label}`}
              role="listitem"
              onClick={() => setOpen(false)}
            >
              <span
                className={styles.shareSocialIcon}
                style={{ background: opt.color, color: "#fff" }}
              >
                {opt.icon}
              </span>
              <span className={styles.shareSocialLabel}>{opt.label}</span>
            </a>
          ))}
        </div>

        {/* Divider */}
        <div className={styles.shareDivider} />

        {/* VioLink branded CTA */}
        <div className={styles.shareCta}>
          <p className={styles.shareCtaText}>
            Bergabung dengan <strong>{name}</strong> di VioLink.<br />
            <span style={{ fontWeight: 400 }}>Buat link page gratis kamu sendiri sekarang.</span>
          </p>
          <a href="/" className={styles.shareCtaBtn} rel="noopener noreferrer">
            Daftar gratis
          </a>
          <a href="/#tentang" className={styles.shareCtaBtnSecondary} rel="noopener noreferrer">
            Cari tahu lebih lanjut
          </a>
        </div>

        {/* Report link */}
        <div className={styles.shareReportWrap}>
          <button className={styles.shareReportBtn} onClick={() => setOpen(false)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
              <line x1="4" y1="22" x2="4" y2="15" />
            </svg>
            Laporkan tautan
          </button>
        </div>
      </div>
    </>,
    document.body
  ) : null;

  return (
    <>
      {/* 3-dot trigger */}
      <button
        ref={btnRef}
        className={styles.shareBtn}
        onClick={() => setOpen(v => !v)}
        aria-label="Opsi lainnya"
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
          <polyline points="16 6 12 2 8 6" />
          <line x1="12" y1="2" x2="12" y2="15" />
        </svg>
      </button>

      {open && modal}
    </>
  );
}

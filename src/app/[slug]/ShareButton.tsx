"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./profile.module.css";

interface ShareButtonProps {
  name: string;
  slug: string;
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
    getUrl: (url: string, name: string) =>
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
    getUrl: (url: string, name: string) =>
      `https://x.com/intent/tweet?text=${encodeURIComponent(`Check out ${name}'s links!`)}&url=${encodeURIComponent(url)}`,
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
    getUrl: (url: string, name: string) =>
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(`${name}'s VioLink`)}`,
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
    getUrl: (url: string) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
];

export function ShareButton({ name, slug }: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const btnRef   = useRef<HTMLButtonElement>(null);

  const profileUrl =
    typeof window !== "undefined"
      ? window.location.href
      : `https://violink.space/${slug}`;

  // Close on outside click / Escape
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    const handleClick = (e: MouseEvent) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        btnRef.current   && !btnRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", handleKey);
    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.removeEventListener("mousedown", handleClick);
    };
  }, [open]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  const handleSocialShare = (getUrl: (url: string, name: string) => string) => {
    window.open(getUrl(profileUrl, name), "_blank", "noopener,noreferrer,width=600,height=480");
    setOpen(false);
  };

  return (
    <>
      {/* 3-dot trigger */}
      <button
        ref={btnRef}
        className={styles.shareBtn}
        onClick={() => setOpen(v => !v)}
        aria-label="More options"
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        {/* Vertical 3 dots */}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <circle cx="12" cy="5"  r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="12" cy="19" r="2" />
        </svg>
      </button>

      {/* Backdrop */}
      {open && (
        <div className={styles.shareBackdrop} onClick={() => setOpen(false)} aria-hidden />
      )}

      {/* Share Panel */}
      {open && (
        <div
          ref={panelRef}
          className={styles.sharePanel}
          role="dialog"
          aria-modal="true"
          aria-label="Share profile"
        >
          {/* Header */}
          <div className={styles.sharePanelHeader}>
            <span className={styles.sharePanelTitle}>Share profile</span>
            <button
              className={styles.sharePanelClose}
              onClick={() => setOpen(false)}
              aria-label="Close"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Profile preview card */}
          <div className={styles.sharePreviewCard}>
            <span className={styles.sharePreviewName}>{name}</span>
            <span className={styles.sharePreviewUrl}>{profileUrl.replace(/^https?:\/\//, "")}</span>
          </div>

          {/* Social icons row */}
          <div className={styles.shareSocialRow}>
            {/* Copy link */}
            <button
              className={styles.shareSocialItem}
              onClick={handleCopy}
              aria-label="Copy link"
            >
              <span
                className={styles.shareSocialIcon}
                style={{ background: copied ? "var(--success-soft)" : "var(--bg-strong)", color: copied ? "var(--success)" : "var(--ink-2)" }}
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
              <span className={styles.shareSocialLabel}>{copied ? "Copied!" : "Copy link"}</span>
            </button>

            {/* Social platforms */}
            {SHARE_OPTIONS.map(opt => (
              <button
                key={opt.id}
                className={styles.shareSocialItem}
                onClick={() => handleSocialShare(opt.getUrl)}
                aria-label={`Share to ${opt.label}`}
              >
                <span
                  className={styles.shareSocialIcon}
                  style={{ background: opt.color, color: "#fff" }}
                >
                  {opt.icon}
                </span>
                <span className={styles.shareSocialLabel}>{opt.label}</span>
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className={styles.shareDivider} />

          {/* VioLink branded CTA */}
          <div className={styles.shareCta}>
            <p className={styles.shareCtaText}>
              Buat link page kamu sendiri di <strong>VioLink Studio</strong> — gratis!
            </p>
            <a href="/" className={styles.shareCtaBtn} target="_blank" rel="noopener noreferrer">
              Daftar gratis
            </a>
          </div>
        </div>
      )}
    </>
  );
}

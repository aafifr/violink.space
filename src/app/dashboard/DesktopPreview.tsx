"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import styles from "./dashboard.module.css";

export default function DesktopPreview({ slug: initialSlug }: { slug: string }) {
  const [slug, setSlug] = useState(initialSlug);
  const [copied, setCopied] = useState(false);
  const [iframeSrc, setIframeSrc] = useState("");
  const [profileUrl, setProfileUrl] = useState(""); // set client-side only to avoid hydration mismatch
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Always fetch latest slug from API on mount (handles stale layout cache)
  useEffect(() => {
    fetch("/api/profile")
      .then(r => r.json())
      .then(d => {
        const latestSlug = d.slug ?? initialSlug;
        setSlug(latestSlug);
        setProfileUrl(`${window.location.host}/${latestSlug}`);
        setIframeSrc(`${window.location.origin}/${latestSlug}`);
      })
      .catch(() => {
        setProfileUrl(`${window.location.host}/${initialSlug}`);
        setIframeSrc(`${window.location.origin}/${initialSlug}`);
      });
  }, [initialSlug]);

  // Listen for BroadcastChannel reload signal (from Design/Links/Settings save)
  useEffect(() => {
    if (!slug) return;
    const ch = new BroadcastChannel("preview-reload");
    ch.onmessage = (e) => {
      // Support optional new-slug payload for when slug changes
      const newSlug = e.data?.slug ?? slug;
      if (newSlug !== slug) setSlug(newSlug);
      const src = `${window.location.origin}/${newSlug}?t=${Date.now()}`;
      if (iframeRef.current) {
        iframeRef.current.src = src;
      } else {
        setIframeSrc(src);
      }
    };
    return () => ch.close();
  }, [slug]);


  const copyLink = () => {
    if (!profileUrl) return;
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reloadPreview = useCallback(() => {
    // Re-fetch slug in case it changed in Settings
    fetch("/api/profile")
      .then(r => r.json())
      .then(d => {
        const latestSlug = d.slug ?? slug;
        setSlug(latestSlug);
        const src = `${window.location.origin}/${latestSlug}?t=${Date.now()}`;
        if (iframeRef.current) {
          iframeRef.current.src = src;
        } else {
          setIframeSrc(src);
        }
      });
  }, [slug]);

  return (
    <aside className={styles.desktopPreviewPane} aria-label="Live Preview">
      <div className={styles.previewActions}>
        <button className={styles.previewPill} onClick={copyLink} title="Copy profile link">
          <span className={styles.previewUrl}>{copied ? "Copied!" : (profileUrl || "Loading…")}</span>
          {copied ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M8 10a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2h-8a2 2 0 01-2-2v-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M16 8V6a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          )}
        </button>
        <button className={styles.previewCircle} onClick={reloadPreview} title="Refresh preview">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M1 4v6h6M23 20v-6h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M20.49 9A9 9 0 005.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 013.51 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <a href={slug ? `/${slug}` : "#"} target="_blank" rel="noopener noreferrer" className={styles.previewCircle} title="Open live preview">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </a>
      </div>

      <div className={styles.mockup}>
        {iframeSrc ? (
          <iframe
            ref={iframeRef}
            id="live-preview"
            src={iframeSrc}
            className={styles.iframe}
            title="Live Preview"
            onLoad={(e) => {
              try {
                const doc = (e.target as HTMLIFrameElement).contentDocument;
                if (!doc) return;
                // Remove any previously injected style to avoid stacking
                doc.getElementById("__preview-island-fix__")?.remove();
                // Dynamic island overlay sits at ~34px from mockup top.
                // iframe scale is 0.7405, so extra needed = 34 / 0.7405 ≈ 46px → use 52px breathing room.
                // Share button: also push it down by same amount so it clears the island.
                const style = doc.createElement("style");
                style.id = "__preview-island-fix__";
                style.textContent = `
                  body > div:first-child, [class*="page"] {
                    padding-top: calc(56px + 52px) !important;
                  }
                  [class*="shareBtn"] {
                    top: 64px !important;
                  }
                `;
                doc.head.appendChild(style);
              } catch {
                // Cross-origin guard — silently ignore
              }
            }}
          />
        ) : (
          <div className="skeleton" style={{width:'100%', height:'100%'}} />
        )}
      </div>
    </aside>
  );
}

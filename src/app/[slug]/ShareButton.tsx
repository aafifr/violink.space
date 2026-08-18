"use client";

import { useState } from "react";
import styles from "./profile.module.css";

interface ShareButtonProps {
  name: string;
  slug: string;
}

export function ShareButton({ name, slug }: ShareButtonProps) {
  const [state, setState] = useState<"idle" | "copied" | "shared">("idle");

  const handleShare = async () => {
    const url = window.location.href;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `${name}'s VioLink`,
          text: `Check out ${name}'s links!`,
          url,
        });
        setState("shared");
        setTimeout(() => setState("idle"), 2000);
        return;
      } catch {
        // User cancelled or not supported — fall through
      }
    }
    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(url);
      setState("copied");
      setTimeout(() => setState("idle"), 2000);
    } catch {
      // silently ignore
    }
  };

  const tooltip =
    state === "copied" ? "Copied!" :
    state === "shared" ? "Shared!" :
    "Share profile";

  return (
    <button
      className={styles.shareBtn}
      onClick={handleShare}
      aria-label={tooltip}
      data-tooltip={tooltip}
    >
      {state === "copied" || state === "shared" ? (
        /* Checkmark */
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        /* Share */
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
      )}
    </button>
  );
}

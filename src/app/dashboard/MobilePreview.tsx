"use client";

import { useState } from "react";
import styles from "./mobile-preview.module.css";

export default function MobilePreview({ slug }: { slug: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyUrl = () => {
    navigator.clipboard.writeText(`${window.location.host}/${slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!slug) return null;

  return (
    <>
      <button className={styles.navBtn} onClick={() => setIsOpen(true)} aria-label="Preview">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>

      {isOpen && (
        <div className={styles.drawerPortal}>
          <div className={styles.backdrop} onClick={() => setIsOpen(false)} />
          <div className={styles.drawer}>
            <div className={styles.drawerHead}>
              <div className={styles.drawerHandle} />
              <div className={styles.drawerActions}>
                <div className={styles.actionsGroup}>
                  <button className={styles.actionBtn} onClick={copyUrl}>
                    {copied ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 10a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2h-8a2 2 0 01-2-2v-8z"/><path d="M16 8V6a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h2"/></svg>
                    )}
                    {copied ? "Copied" : "Copy"}
                  </button>
                  <a href={`/${slug}`} target="_blank" rel="noopener noreferrer" className={styles.actionBtn}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                    Browser
                  </a>
                </div>
                <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>Close</button>
              </div>
            </div>
            <div className={styles.drawerBody}>
              <iframe 
                src={`/${slug}`} 
                className={styles.iframe} 
                title="Live Preview"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

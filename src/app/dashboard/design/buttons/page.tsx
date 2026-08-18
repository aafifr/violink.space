"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import styles from "./buttons.module.css";

function Toast({ msg, onDone }: { msg: string; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 2600); return () => clearTimeout(t); }, [onDone]);
  return <div className="toast"><span className="toast-icon">✓</span>{msg}</div>;
}

export default function DesignButtonsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [isPending, startTx] = useTransition();
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/profile").then(r => r.json()).then(d => {
      setProfile(d);
    });
  }, []);

  if (!profile) {
    return <div className={styles.container}><div className="skeleton" style={{height: 200}}/></div>;
  }

  const updateSetting = (key: string, value: string | null) => {
    setProfile((prev: any) => ({ ...prev, [key]: value }));
    startTx(async () => {
      await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: value })
      });
      new BroadcastChannel("preview-reload").postMessage("reload");
    });
  };

  const isCustom = profile.btnStyle !== "default";

  return (
    <div className={styles.container}>
      <div className={styles.editorPane}>
        <header className={styles.pageHead}>
          <div className={styles.headLeft}>
            <Link href="/dashboard/design" className={styles.backBtn}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M10 13L5 8l5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Kembali
            </Link>
            <h1 className={styles.title}>Buttons</h1>
          </div>
        </header>

        {/* BUTTON STYLE */}
        <section className={styles.section} style={{ animationDelay: "0.1s" }}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Button style</h2>
          </div>
          <div className={styles.styleGrid}>
            <button 
              className={`${styles.styleCard} ${profile.btnStyle === "solid" ? styles.styleActive : ""}`}
              onClick={() => updateSetting("btnStyle", "solid")}
            >
              <div className={styles.stylePreviewBg}>
                <div className={styles.stylePreviewBtn} style={{ background: "#FFFFFF", border: "none" }} />
              </div>
              <span className={styles.styleLabel}>Solid</span>
            </button>
            <button 
              className={`${styles.styleCard} ${profile.btnStyle === "glass" ? styles.styleActive : ""}`}
              onClick={() => updateSetting("btnStyle", "glass")}
            >
              <div className={styles.stylePreviewBg}>
                <div className={styles.stylePreviewBtn} style={{ 
                  background: "linear-gradient(160deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.28) 60%, rgba(255,255,255,0.14) 100%)", 
                  border: "1px solid rgba(255,255,255,0.7)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6), 0 2px 8px rgba(255,255,255,0.15)"
                }} />
              </div>
              <span className={styles.styleLabel}>Glass</span>
            </button>
            <button 
              className={`${styles.styleCard} ${profile.btnStyle === "outline" ? styles.styleActive : ""}`}
              onClick={() => updateSetting("btnStyle", "outline")}
            >
              <div className={styles.stylePreviewBg}>
                <div className={styles.stylePreviewBtn} style={{ background: "transparent", border: "1.5px solid #FFFFFF" }} />
              </div>
              <span className={styles.styleLabel}>Outline</span>
            </button>
          </div>
        </section>

        {/* CORNER ROUNDNESS */}
        <section className={styles.section} style={{ animationDelay: "0.2s" }}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Corner roundness</h2>
            <div className={styles.radiusRow}>
              {["square", "rounded", "pill"].map(rad => (
                <button 
                  key={rad}
                  className={`${styles.radiusBtn} ${profile.btnRadius === rad ? styles.radiusActive : ""}`}
                  onClick={() => updateSetting("btnRadius", rad)}
                  title={rad}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    {rad === "square" && <path d="M5 19V5h14" stroke="currentColor" strokeWidth="2" strokeLinecap="square"/>}
                    {rad === "rounded" && <path d="M5 19V9a4 4 0 014-4h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>}
                    {rad === "pill" && <path d="M5 19V12a7 7 0 017-7h7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>}
                  </svg>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* BUTTON COLOR */}
        <section className={styles.section} style={{ animationDelay: "0.3s" }}>
          <div className={styles.colorPickerRow}>
            <span className={styles.colorLabel}>Button color</span>
            <div className={styles.colorInputWrap}>
              <input 
                type="color" 
                className={styles.colorInputNative}
                value={profile.btnColor || "#FFFFFF"} 
                onChange={(e) => updateSetting("btnColor", e.target.value)}
              />
              <span className={styles.colorInputHex}>{profile.btnColor || "#FFFFFF"}</span>
            </div>
          </div>
        </section>

        {/* TEXT COLOR */}
        <section className={styles.section} style={{ animationDelay: "0.4s" }}>
          <div className={styles.colorPickerRow}>
            <span className={styles.colorLabel}>Button text color</span>
            <div className={styles.colorInputWrap}>
              <input 
                type="color" 
                className={styles.colorInputNative}
                value={profile.btnTextColor || "#000000"} 
                onChange={(e) => updateSetting("btnTextColor", e.target.value)}
              />
              <span className={styles.colorInputHex}>{profile.btnTextColor || "#000000"}</span>
            </div>
          </div>
        </section>

        {/* RESET */}
        {isCustom && (
          <button 
            className={styles.resetBtn}
            onClick={() => {
              setProfile((prev: any) => ({ ...prev, btnStyle: "default", btnRadius: "default", btnColor: null, btnTextColor: null }));
              startTx(async () => {
                await fetch("/api/profile", {
                  method: "PATCH",
                  body: JSON.stringify({ btnStyle: "default", btnRadius: "default", btnColor: null, btnTextColor: null })
                });
                setToast("Tombol dikembalikan ke tema default");
                new BroadcastChannel("preview-reload").postMessage("reload");
              });
            }}
            disabled={isPending}
          >
            Reset ke Tema
          </button>
        )}

      </div>
      <div className="toast-portal">{toast && <Toast msg={toast} onDone={() => setToast(null)} />}</div>
    </div>
  );
}

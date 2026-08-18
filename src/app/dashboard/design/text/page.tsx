"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import styles from "../buttons/buttons.module.css";

function Toast({ msg, onDone }: { msg: string; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 2600); return () => clearTimeout(t); }, [onDone]);
  return <div className="toast"><span className="toast-icon">✓</span>{msg}</div>;
}

const FONTS = [
  { id: "default", label: "Default (dari tema)" },
  { id: "'Inter', system-ui, sans-serif", label: "Inter — Bersih & Modern" },
  { id: "'Outfit', system-ui, sans-serif", label: "Outfit — Geometris" },
  { id: "'Space Grotesk', system-ui, sans-serif", label: "Space Grotesk — Kaku" },
  { id: "'Poppins', system-ui, sans-serif", label: "Poppins — Bulat & Ramah" },
  { id: "Georgia, 'Times New Roman', serif", label: "Georgia — Klasik & Elegan" },
];

export default function DesignTextPage() {
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

  const isCustom = profile.fontFamily !== "default" || profile.fontColor;

  return (
    <div className={styles.container}>
      <div className={styles.editorPane}>
        <header className={styles.pageHead}>
          <div className={styles.headLeft}>
            <Link href="/dashboard/design" className={styles.backBtn}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M10 13L5 8l5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Kembali
            </Link>
            <h1 className={styles.title}>Text</h1>
          </div>
        </header>

        {/* FONT SELECTOR */}
        <section className={styles.section} style={{ animationDelay: "0.1s" }}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Page font</h2>
          </div>
          <div style={{
            background: "var(--surface)",
            border: "1px solid var(--line-mid)",
            borderRadius: "var(--r-lg)",
            overflow: "hidden"
          }}>
            {FONTS.map((f, i) => (
              <button
                key={f.id}
                onClick={() => updateSetting("fontFamily", f.id)}
                style={{
                  width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "14px 16px", background: "transparent", border: "none",
                  borderBottom: i < FONTS.length - 1 ? "1px solid var(--line)" : "none",
                  cursor: "pointer", textAlign: "left",
                  fontFamily: f.id !== "default" ? f.id : "inherit",
                  fontWeight: 500, fontSize: "0.95rem",
                  color: "var(--ink)",
                }}
              >
                <span>{f.label}</span>
                {(profile.fontFamily || "default") === f.id && (
                  <span style={{
                    width: 18, height: 18, borderRadius: "50%",
                    background: "var(--ink)", color: "var(--bg)",
                    display: "grid", placeItems: "center", fontSize: "0.7rem", fontWeight: 900, flexShrink: 0
                  }}>✓</span>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* TEXT COLOR */}
        <section className={styles.section} style={{ animationDelay: "0.2s" }}>
          <div className={styles.colorPickerRow}>
            <span className={styles.colorLabel}>Page text color</span>
            <div className={styles.colorInputWrap}>
              <input
                type="color"
                className={styles.colorInputNative}
                value={profile.fontColor || "#000000"}
                onChange={(e) => updateSetting("fontColor", e.target.value)}
              />
              <span className={styles.colorInputHex}>{profile.fontColor || "#000000"}</span>
            </div>
          </div>
          <p style={{ fontSize: "var(--text-xs)", color: "var(--muted)" }}>
            Jika diatur, warna teks halaman ini akan menggantikan warna teks bawaan tema.
          </p>
        </section>

        {/* RESET */}
        {isCustom && (
          <button
            className={styles.resetBtn}
            onClick={() => {
              setProfile((prev: any) => ({ ...prev, fontFamily: "default", fontColor: null }));
              startTx(async () => {
                await fetch("/api/profile", {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ fontFamily: "default", fontColor: null })
                });
                setToast("Font dikembalikan ke tema default");
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

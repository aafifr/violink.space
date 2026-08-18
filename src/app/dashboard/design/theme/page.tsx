"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import styles from "./theme.module.css";

// ─── THEME DEFINITIONS (same as before) ──────────────────────────────────────
type Theme = {
  id: string; label: string; category: string;
  pageBg: string; cardBg: string; cardBorder: string;
  linkBg: string; linkBorder: string; linkShadow?: string;
  textColor: string; mutedColor: string; accentColor: string;
  linkRadius: string; desc: string;
};

const THEMES: Theme[] = [
  { id: "default",       label: "Clean White",    category: "clean",  desc: "Minimal & profesional",       pageBg: "#F3F4F6",  cardBg: "#FFFFFF",              cardBorder: "rgba(0,0,0,0.08)",      linkBg: "rgba(255,255,255,0.85)", linkBorder: "rgba(0,0,0,0.08)",      textColor: "#0A0A0B", mutedColor: "#6B7280", accentColor: "#4F46E5", linkRadius: "12px" },
  { id: "clean-dark",    label: "Slate Dark",     category: "clean",  desc: "Dark mode elegan",            pageBg: "#0A0C12",  cardBg: "#12141E",              cardBorder: "rgba(255,255,255,0.07)", linkBg: "rgba(255,255,255,0.05)", linkBorder: "rgba(255,255,255,0.09)", textColor: "#F0F1F7", mutedColor: "#7B829E", accentColor: "#818CF8", linkRadius: "12px" },
  { id: "aurora",        label: "Aurora",         category: "glass",  desc: "Glassmorphism ungu-biru",     pageBg: "linear-gradient(135deg,#1E1040 0%,#0D1B4B 60%,#0B2340 100%)", cardBg: "rgba(255,255,255,0.07)", cardBorder: "rgba(255,255,255,0.13)", linkBg: "rgba(255,255,255,0.09)", linkBorder: "rgba(255,255,255,0.16)", linkShadow: "0 2px 12px rgba(0,0,0,0.2)", textColor: "#FFFFFF", mutedColor: "rgba(255,255,255,0.55)", accentColor: "#A78BFA", linkRadius: "12px" },
  { id: "frosted-rose",  label: "Frosted Rose",   category: "glass",  desc: "Glassmorphism pink romantis", pageBg: "linear-gradient(135deg,#2D0A1E 0%,#1A0A2E 50%,#240D3A 100%)",  cardBg: "rgba(255,255,255,0.06)", cardBorder: "rgba(255,210,230,0.15)", linkBg: "rgba(255,255,255,0.09)", linkBorder: "rgba(255,180,210,0.2)", linkShadow: "0 2px 12px rgba(0,0,0,0.2)", textColor: "#FFFFFF", mutedColor: "rgba(255,200,230,0.65)", accentColor: "#F472B6", linkRadius: "12px" },
  { id: "neobrutalism",  label: "Brutal Black",   category: "brutal", desc: "Bold & playful, border tebal", pageBg: "#FAF0A0", cardBg: "#FEFCE8",              cardBorder: "#0A0A0B",               linkBg: "#FEFCE8",               linkBorder: "#0A0A0B",               linkShadow: "4px 4px 0 #0A0A0B", textColor: "#0A0A0B", mutedColor: "#3D3A20", accentColor: "#0A0A0B", linkRadius: "8px" },
  { id: "retro-pop",     label: "Retro Pop",      category: "brutal", desc: "Bold oranye, vibes 90s",      pageBg: "#FF4500",  cardBg: "#CC3700",              cardBorder: "#0A0A0B",               linkBg: "rgba(0,0,0,0.25)",      linkBorder: "#0A0A0B",               linkShadow: "3px 3px 0 #0A0A0B", textColor: "#FFFFFF", mutedColor: "rgba(255,220,200,0.8)", accentColor: "#FFFFFF", linkRadius: "6px" },
  { id: "midnight",      label: "Midnight",       category: "dark",   desc: "Neon glow, futuristik",       pageBg: "#08080F",  cardBg: "#0D0D1A",              cardBorder: "rgba(139,92,246,0.15)", linkBg: "rgba(139,92,246,0.08)", linkBorder: "rgba(139,92,246,0.22)", linkShadow: "0 0 16px rgba(139,92,246,0.08)", textColor: "#E8E6FF", mutedColor: "#7270A0", accentColor: "#A78BFA", linkRadius: "12px" },
  { id: "forest",        label: "Forest",         category: "dark",   desc: "Earthy green, natural",       pageBg: "#091409",  cardBg: "#0F1C0F",              cardBorder: "rgba(74,222,128,0.12)", linkBg: "rgba(74,222,128,0.07)", linkBorder: "rgba(74,222,128,0.18)",                                   textColor: "#E4F0E4", mutedColor: "#6A8C6A", accentColor: "#4ADE80", linkRadius: "12px" },
];

const CATEGORIES = [
  { id: "clean",  label: "Clean" },
  { id: "glass",  label: "Glass" },
  { id: "brutal", label: "Brutal" },
  { id: "dark",   label: "Dark" },
];

function Toast({ msg, type="ok", onDone }: { msg:string; type?:"ok"|"err"; onDone:()=>void }) {
  useEffect(() => { const t = setTimeout(onDone, 2600); return () => clearTimeout(t); }, [onDone]);
  return <div className="toast"><span className={"toast-icon"+(type==="err"?" danger":"")}>{type==="ok"?"✓":"✗"}</span>{msg}</div>;
}

function ThemeThumbnail({ t, active }: { t: Theme; active: boolean }) {
  const w = 120, h = 160;
  const links = [{ y: 76 }, { y: 104 }, { y: 132 }];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"
      className={styles.thumbnail} style={{ opacity: active ? 1 : 0.88, display: 'block' }}>
      {t.pageBg.startsWith("linear-gradient") ? (
        <><defs><linearGradient id={`bg-${t.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor={t.pageBg.match(/#[0-9a-fA-F]{6}/g)?.[0] ?? "#111"} />
          <stop offset="100%" stopColor={t.pageBg.match(/#[0-9a-fA-F]{6}/g)?.[2] ?? "#222"} />
        </linearGradient></defs>
        <rect width={w} height={h} fill={`url(#bg-${t.id})`} /></>
      ) : (
        <rect width={w} height={h} fill={t.pageBg} />
      )}
      <rect x={10} y={10} width={100} height={145} rx={10} fill={t.cardBg} stroke={t.cardBorder} strokeWidth={t.id==="neobrutalism"||t.id==="retro-pop"?2:0.75} />
      <circle cx={60} cy={38} r={14} fill={t.linkBg} stroke={t.accentColor} strokeWidth={1.5} />
      <text x={60} y={43} textAnchor="middle" fontSize={10} fontWeight="700" fill={t.accentColor}>A</text>
      <rect x={32} y={58} width={56} height={6} rx={3} fill={t.textColor} opacity={0.85} />
      <rect x={40} y={68} width={40} height={4} rx={2} fill={t.mutedColor} opacity={0.6} />
      {links.map((link, i) => (
        <g key={i}>
          <rect x={16} y={link.y} width={88} height={22} rx={Number(t.linkRadius.replace("px",""))*0.3}
            fill={t.linkBg} stroke={t.linkBorder} strokeWidth={t.id==="neobrutalism"||t.id==="retro-pop"?1.5:0.6}
            style={t.linkShadow?{filter:"drop-shadow(2px 2px 0 rgba(0,0,0,0.5))"}:{}} />
          <circle cx={28} cy={link.y+11} r={5} fill={t.accentColor} opacity={0.7} />
          <rect x={36} y={link.y+8} width={42} height={4} rx={2} fill={t.textColor} opacity={0.75} />
          <text x={98} y={link.y+14} fontSize={7} fill={t.mutedColor} textAnchor="middle">›</text>
        </g>
      ))}
    </svg>
  );
}

export default function ThemePage() {
  const [theme, setTheme]       = useState("default");
  const [loading, setLoading]   = useState(true);
  const [isPending, startTx]    = useTransition();
  const [toast, setToast]       = useState<{msg:string;type:"ok"|"err"}|null>(null);
  const [activeCat, setActiveCat] = useState<string>("all");

  useEffect(() => {
    fetch("/api/profile").then(r => r.json()).then(d => {
      const validIds = THEMES.map(t => t.id);
      setTheme(validIds.includes(d.theme) ? d.theme : "default");
      setLoading(false);
    });
  }, []);

  const saveTheme = (newId: string) => {
    if (newId === theme) return;
    setTheme(newId);
    startTx(async () => {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        body: JSON.stringify({ 
          theme: newId, 
          bgType: "default",
          btnStyle: "default",
          btnRadius: "default"
        })
      });
      if (res.ok) {
        setToast({ msg: "Tema tersimpan!", type: "ok" });
        try { new BroadcastChannel("preview-reload").postMessage("reload"); } catch {}
      } else {
        setToast({ msg: "Gagal menyimpan", type: "err" });
      }
    });
  };

  if (loading) return (
    <div className={styles.container}>
      <div className={styles.editorPane}>
        <div className={styles.pageHead}>
          <Link href="/dashboard/design" className={styles.backBtn}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Design
          </Link>
          <h1 className={styles.title}>Theme</h1>
        </div>
        <div className={styles.themeGrid}>
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className={styles.themeCard} style={{ border: 'none', background: 'transparent' }}>
              <div className="skeleton" style={{ width: '100%', aspectRatio: '120/160', borderRadius: '12px' }} />
              <div className="skeleton" style={{ width: '60%', height: '14px', borderRadius: '4px', marginTop: '10px' }} />
              <div className="skeleton" style={{ width: '80%', height: '10px', borderRadius: '4px', marginTop: '4px' }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const activeTheme = THEMES.find(t => t.id === theme);

  return (
    <div className={styles.container}>
      <div className={styles.editorPane}>
        <header className={styles.pageHead}>
          <div className={styles.headLeft}>
            <Link href="/dashboard/design" className={styles.backBtn}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Design
            </Link>
            <h1 className={styles.title}>Theme</h1>
          </div>
          {activeTheme && (
            <div className={styles.activeBadge}>
              <span className={styles.activeDot} />
              {activeTheme.label}
            </div>
          )}
        </header>

        {/* ── STICKY CATEGORY TABS ── */}
        <div className={styles.categoryPills}>
          <button 
            className={styles.pill + (activeCat === "all" ? " " + styles.pillActive : "")}
            onClick={() => setActiveCat("all")}
          >
            All
          </button>
          {CATEGORIES.map(cat => (
            <button 
              key={cat.id}
              className={styles.pill + (activeCat === cat.id ? " " + styles.pillActive : "")}
              onClick={() => setActiveCat(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* ── THEMES GRID ── */}
        <div className={styles.themeGrid}>
          {THEMES.filter(t => activeCat === "all" || t.category === activeCat).map((t, idx) => {
            const isActive = theme === t.id;
            return (
              <button key={t.id}
                className={styles.themeCard + (isActive ? " " + styles.themeActive : "")}
                style={{ animationDelay: `${idx * 40}ms` }}
                onClick={() => saveTheme(t.id)}
                aria-pressed={isActive}
                aria-label={`Pilih tema ${t.label}`}
                disabled={isPending}
              >
                <div className={styles.thumbnailWrap}>
                  <ThemeThumbnail t={t} active={isActive} />
                  {isActive && (
                    <div className={styles.activeOverlay}>
                      <span className={styles.checkMark}>✓</span>
                    </div>
                  )}
                </div>
                <div className={styles.themeInfo}>
                  <strong className={styles.themeName}>{t.label}</strong>
                  <span className={styles.themeDesc}>{t.desc}</span>
                </div>
              </button>
            );
          })}
        </div>
        
        <p className={styles.hint}>Perubahan langsung diterapkan ke halaman publik kamu.</p>
      </div>
      <div className="toast-portal">{toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}</div>
    </div>
  );
}

"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { slugify, initialsFromName } from "@/lib/utils";
import styles from "./onboarding.module.css";

const THEMES = [
  { id:"indigo",  label:"Indigo",   color:"#4F46E5" },
  { id:"slate",   label:"Slate",    color:"#334155" },
  { id:"crimson", label:"Crimson",  color:"#DC2626" },
  { id:"amber",   label:"Amber",    color:"#D97706" },
  { id:"emerald", label:"Emerald",  color:"#059669" },
  { id:"rose",    label:"Rose",     color:"#E11D48" },
];

type Step = 1|2|3|4|5;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [slug, setSlug] = useState("");
  const [slugAvail, setSlugAvail] = useState<boolean|null>(null);
  const [slugChecking, setSlugChecking] = useState(false);
  const [linkTitle, setLinkTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [theme, setTheme] = useState("indigo");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  // Slug availability debounce
  useEffect(() => {
    if (!slug) { setSlugAvail(null); return; }
    setSlugChecking(true);
    const t = setTimeout(async () => {
      const res = await fetch(`/api/slug?slug=${slug}`);
      const d = await res.json();
      setSlugAvail(d.available);
      setSlugChecking(false);
    }, 420);
    return () => clearTimeout(t);
  }, [slug]);

  useEffect(() => {
    if (step === 5) {
      import("canvas-confetti").then((confetti) => {
        confetti.default({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: ['#a864fd', '#29cdff', '#78ff44', '#ff718d', '#fdff6a'] });
      });
    }
  }, [step]);

  const handleNext = () => setStep((s) => Math.min(s + 1, 5) as Step);
  const handleBack = () => setStep((s) => Math.max(s - 1, 1) as Step);

  const handleFinish = () => {
    startTransition(async () => {
      const res = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, bio, slug, theme, firstLink: { title: linkTitle, url: linkUrl } }),
      });
      const d = await res.json();
      if (!res.ok) { setError(d.error || "Something went wrong"); return; }
      router.push("/dashboard");
    });
  };

  const initials = initialsFromName(name || "You");
  const currentTheme = THEMES.find(t => t.id === theme)!;

  return (
    <div className={styles.page} data-theme={theme}>
      <div className="orb orb-1" aria-hidden />
      <div className="orb orb-2" aria-hidden />

      {/* PROGRESS */}
      <div className={styles.progress} aria-label={`Step ${step} of 5`}>
        {([1,2,3,4,5] as Step[]).map(s => (
          <div key={s} className={styles.progressDot + (s <= step ? " " + styles.progressDotActive : "")} />
        ))}
      </div>

      <div className={styles.card + " glass"}>
        {/* ─── STEP 1: WELCOME ─── */}
        {step === 1 && (
          <div className={styles.step + " " + styles.stepCenter}>
            <div className={styles.logoBadge}>
              <Image src="/images/logo.png" alt="VioLink Studio" width={48} height={48} />
            </div>
            <h1 className={styles.heading}>Welcome to<br/>VioLink Studio</h1>
            <p className={styles.sub}>Let's build your premium profile in 3 minutes. We'll walk you through everything.</p>
            <div className={styles.featureList}>
              {["Beautiful public profile page", "Live analytics & click tracking", "Full control from creator studio"].map(f => (
                <div key={f} className={styles.featureItem}>
                  <span className={styles.featureCheck}>✓</span>{f}
                </div>
              ))}
            </div>
            <button className={"btn btn-primary " + styles.nextBtn} onClick={handleNext}>
              Let's go →
            </button>
          </div>
        )}

        {/* ─── STEP 2: IDENTITY ─── */}
        {step === 2 && (
          <div className={styles.step}>
            <p className="eyebrow">Step 2 of 5</p>
            <h2 className={styles.heading}>Tell us about you</h2>
            <p className={styles.sub}>This will appear on your public profile.</p>

            <div className={styles.fields}>
              <div className="field">
                <label className="field-label" htmlFor="name">Display name</label>
                <input id="name" className="input" placeholder="Your Name" maxLength={36}
                  value={name} onChange={e => setName(e.target.value)} autoFocus />
              </div>

              <div className="field">
                <label className="field-label" htmlFor="bio">Short bio <span style={{color:"var(--muted)",fontWeight:400}}>({bio.length}/160)</span></label>
                <textarea id="bio" className={"input textarea " + styles.bioInput} placeholder="A few words about you…" maxLength={160}
                  value={bio} onChange={e => setBio(e.target.value)} rows={3} />
              </div>

              <div className="field">
                <label className="field-label" htmlFor="slug">Your unique link</label>
                <div className="input-prefix-wrap">
                  <span className="input-prefix">violink.space/</span>
                  <input id="slug" className="input" placeholder="yourname" maxLength={24} spellCheck={false}
                    value={slug} onChange={e => setSlug(slugify(e.target.value))} />
                </div>
                {slug && (
                  <span className={"field-hint " + (slugChecking ? "" : slugAvail ? styles.avail : styles.taken)}>
                    {slugChecking ? "Checking…" : slugAvail ? "✓ Available" : "✗ Already taken"}
                  </span>
                )}
              </div>
            </div>

            <div className={styles.navRow}>
              <button className="btn btn-ghost" onClick={handleBack}>← Back</button>
              <button className={"btn btn-primary " + styles.nextBtn}
                disabled={!name || !slug || slugAvail === false || slugChecking}
                onClick={handleNext}>Continue →</button>
            </div>
          </div>
        )}

        {/* ─── STEP 3: FIRST LINK ─── */}
        {step === 3 && (
          <div className={styles.step}>
            <p className="eyebrow">Step 3 of 5</p>
            <h2 className={styles.heading}>Add your first link</h2>
            <p className={styles.sub}>This will be your featured primary destination.</p>

            <div className={styles.fields}>
              <div className="field">
                <label className="field-label" htmlFor="link-title">Link title</label>
                <input id="link-title" className="input" placeholder="My Website" maxLength={60}
                  value={linkTitle} onChange={e => setLinkTitle(e.target.value)} autoFocus />
              </div>
              <div className="field">
                <label className="field-label" htmlFor="link-url">URL</label>
                <div className="input-prefix-wrap">
                  <span className="input-prefix">https://</span>
                  <input id="link-url" className="input" placeholder="example.com"
                    value={linkUrl} onChange={e => setLinkUrl(e.target.value)} />
                </div>
              </div>
            </div>

            {linkTitle && linkUrl && (
              <div className={styles.linkPreview}>
                <span className={styles.linkPreviewTitle}>{linkTitle}</span>
                <span className={styles.linkPreviewUrl}>{linkUrl}</span>
                <span className="chip chip-accent">Featured</span>
              </div>
            )}

            <div className={styles.navRow}>
              <button className="btn btn-ghost" onClick={handleBack}>← Back</button>
              <button className={"btn btn-primary " + styles.nextBtn}
                onClick={handleNext}>
                {linkTitle || linkUrl ? "Continue →" : "Skip for now"}
              </button>
            </div>
          </div>
        )}

        {/* ─── STEP 4: THEME ─── */}
        {step === 4 && (
          <div className={styles.step}>
            <p className="eyebrow">Step 4 of 5</p>
            <h2 className={styles.heading}>Pick your accent mood</h2>
            <p className={styles.sub}>Sets the color of your buttons, highlights, and featured link.</p>

            <div className={styles.themeGrid}>
              {THEMES.map(t => (
                <button key={t.id} className={styles.themeCard + (theme === t.id ? " " + styles.themeCardActive : "")}
                  onClick={() => setTheme(t.id)}>
                  <span className={styles.themeSwatch} style={{ background: t.color }} />
                  <span className={styles.themeLabel}>{t.label}</span>
                  {theme === t.id && <span className={styles.themeCheck}>✓</span>}
                </button>
              ))}
            </div>

            {/* Mini preview */}
            <div className={styles.themePreview} data-theme={theme}>
              <div className={styles.themePreviewAvatar}>{initials}</div>
              <div className={styles.themePreviewLink} style={{ background: 'var(--accent-soft)', borderColor: 'var(--accent-mid)', color: 'var(--accent-str)' }}>
                <span>{linkTitle || "My Website"}</span>
              </div>
            </div>

            <div className={styles.navRow}>
              <button className="btn btn-ghost" onClick={handleBack}>← Back</button>
              <button className={"btn btn-primary " + styles.nextBtn} onClick={handleNext}>Continue →</button>
            </div>
          </div>
        )}

        {/* ─── STEP 5: DONE ─── */}
        {step === 5 && (
          <div className={styles.step + " " + styles.stepCenter}>
            <div className={styles.doneIcon} aria-hidden>🎉</div>
            <h2 className={styles.heading}>You're all set!</h2>
            <p className={styles.sub}>Your profile is ready to go live. You can always edit everything from the creator studio.</p>

            <div className={styles.summaryCard}>
              <div className={styles.summaryRow}><span className="eyebrow">Profile name</span><strong>{name}</strong></div>
              <div className={styles.summaryRow}><span className="eyebrow">Your link</span><strong>violink.space/{slug}</strong></div>
              <div className={styles.summaryRow}><span className="eyebrow">Theme</span><strong>{currentTheme.label}</strong></div>
            </div>

            {error && <div style={{color:"var(--danger)",fontSize:".88rem",textAlign:"center"}}>{error}</div>}

            <button className={"btn btn-primary " + styles.nextBtn} onClick={handleFinish} disabled={isPending}>
              {isPending ? <span className="spinner" /> : null}
              Open my studio →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `${r},${g},${b}`;
}

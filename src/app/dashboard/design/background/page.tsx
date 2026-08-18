"use client";

import { useState, useEffect, useTransition, useRef, useCallback } from "react";
import Link from "next/link";
import styles from "./background.module.css";
import {
  GRADIENTS, SOLID_COLORS, PATTERNS, computeBgStyle, computePatternStyle,
  ANIMATED_GRADIENT_KEYS,
  type GradientKey, type BgType, type PatternKey,
} from "@/lib/backgrounds";

function Toast({ msg, type="ok", onDone }: { msg:string; type?:"ok"|"err"; onDone:()=>void }) {
  useEffect(() => { const t = setTimeout(onDone, 2600); return () => clearTimeout(t); }, [onDone]);
  return <div className="toast"><span className={"toast-icon"+(type==="err"?" danger":"")}>{type==="ok"?"✓":"✗"}</span>{msg}</div>;
}

// ─── GRADIENT SWATCH ──────────────────────────────────────────────────────────
function GradientSwatch({ id, active, delay, onClick }: { id: GradientKey; active: boolean; delay: number; onClick: () => void }) {
  const g = GRADIENTS[id];
  return (
    <button
      className={styles.gradientSwatch + (active ? " " + styles.swatchActive : "")}
      onClick={onClick}
      title={g.label}
      aria-label={`Background gradient ${g.label}`}
      aria-pressed={active}
      style={{ background: g.css, backgroundSize: g.animated ? "200% 200%" : undefined, animationDelay: `${delay}ms` }}
    >
      {g.animated && <span className={styles.swatchLiveBadge}>✦</span>}
      {active && <span className={styles.swatchCheck}>✓</span>}
      <span className={styles.swatchLabel}>{g.label}</span>
    </button>
  );
}

// ─── SOLID COLOR SWATCH ───────────────────────────────────────────────────────
function ColorSwatch({ hex, label, active, delay, onClick }: { hex: string; label: string; active: boolean; delay: number; onClick: () => void }) {
  const isDark = parseInt(hex.slice(1,3),16)*0.299 + parseInt(hex.slice(3,5),16)*0.587 + parseInt(hex.slice(5,7),16)*0.114 < 128;
  return (
    <button
      className={styles.colorSwatch + (active ? " " + styles.swatchActive : "")}
      onClick={onClick}
      title={label}
      aria-label={`Background color ${label}`}
      aria-pressed={active}
      style={{ background: hex, borderColor: active ? (isDark ? "#fff" : "#000") : "transparent", animationDelay: `${delay}ms` }}
    >
      {active && <span className={styles.swatchCheck} style={{ color: isDark ? "#fff" : "#000" }}>✓</span>}
    </button>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function BackgroundPage() {
  const [activeTab, setActiveTab] = useState<"gradient" | "solid" | "image">("gradient");
  const [bgType,    setBgType]    = useState<BgType>("default");
  const [bgValue,   setBgValue]   = useState<string>("");
  const [bgOverlay, setBgOverlay] = useState<number>(0);
  const [bgEffect,  setBgEffect]  = useState<"none" | "blur">("none");
  const [bgPattern, setBgPattern] = useState<PatternKey>("none");
  const [loading,   setLoading]   = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isPending, startTx]      = useTransition();
  const [toast,     setToast]     = useState<{msg:string;type:"ok"|"err"}|null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Image source mode
  const [imageMode, setImageMode] = useState<"upload" | "url">("upload");
  const [urlInput,  setUrlInput]  = useState("");
  const [urlError,  setUrlError]  = useState("");

  // Custom color picker state
  const [customHex, setCustomHex] = useState("#7C3AED");
  const [hexInput,  setHexInput]  = useState("#7C3AED");

  // Custom gradient builder state
  const [gradColor1, setGradColor1] = useState("#7C3AED");
  const [gradColor2, setGradColor2] = useState("#06B6D4");
  const [gradAngle,  setGradAngle]  = useState(135);

  // Load current values
  useEffect(() => {
    fetch("/api/profile").then(r => r.json()).then(d => {
      setBgType(d.bgType ?? "default");
      setBgValue(d.bgValue ?? "");
      setBgOverlay(d.bgOverlay ?? 0);
      setBgEffect(d.bgEffect ?? "none");
      setBgPattern(d.bgPattern ?? "none");
      if (d.bgType && d.bgType !== "default") {
        setActiveTab(d.bgType === "image" ? "image" : d.bgType === "custom-gradient" ? "gradient" : d.bgType);
      }
      setLoading(false);
    });
  }, []);

  const save = useCallback((type: BgType, value: string, overlay: number, effect?: string, pattern?: PatternKey) => {
    startTx(async () => {
      const res = await fetch("/api/profile", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bgType: type, bgValue: value || null, bgOverlay: overlay,
          bgEffect: effect ?? bgEffect,
          bgPattern: pattern ?? bgPattern,
        }),
      });
      if (res.ok) {
        setToast({ msg: "Background tersimpan!", type: "ok" });
        try { new BroadcastChannel("preview-reload").postMessage("reload"); } catch {}
      } else {
        setToast({ msg: "Gagal menyimpan", type: "err" });
      }
    });
  }, [bgEffect, bgPattern]);

  const selectGradient = (key: GradientKey) => {
    setBgType("gradient"); setBgValue(key);
    save("gradient", key, bgOverlay);
  };

  const selectSolid = (hex: string) => {
    setBgType("solid"); setBgValue(hex);
    save("solid", hex, bgOverlay);
  };

  const applyCustomColor = () => {
    const valid = /^#[0-9A-Fa-f]{6}$/.test(hexInput);
    if (!valid) { setToast({ msg: "Kode hex tidak valid", type: "err" }); return; }
    selectSolid(hexInput);
    setCustomHex(hexInput);
  };

  const applyCustomGradient = () => {
    const css = `linear-gradient(${gradAngle}deg, ${gradColor1}, ${gradColor2})`;
    setBgType("custom-gradient"); setBgValue(css);
    save("custom-gradient", css, bgOverlay);
  };

  const resetToDefault = () => {
    setBgType("default"); setBgValue("");
    save("default", "", bgOverlay);
  };

  const handleOverlayChange = (val: number) => {
    setBgOverlay(val);
    save(bgType, bgValue, val);
  };

  const handlePatternChange = (p: PatternKey) => {
    setBgPattern(p);
    save(bgType, bgValue, bgOverlay, bgEffect, p);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/upload/background", { method: "POST", body: form });
    if (res.ok) {
      const { url } = await res.json();
      setBgType("image"); setBgValue(url);
      save("image", url, bgOverlay);
    } else {
      setToast({ msg: "Upload gagal. Max 5 MB.", type: "err" });
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const applyImageUrl = () => {
    const trimmed = urlInput.trim();
    setUrlError("");
    if (!trimmed) { setUrlError("URL tidak boleh kosong"); return; }
    try {
      const parsed = new URL(trimmed);
      if (!parsed.protocol.startsWith("http")) { setUrlError("Gunakan URL yang dimulai dengan https://"); return; }
    } catch {
      setUrlError("Format URL tidak valid");
      return;
    }
    setBgType("image"); setBgValue(trimmed);
    save("image", trimmed, bgOverlay);
    setUrlInput("");
  };

  // Preview swatch for current bg
  const computedBg = computeBgStyle(bgType, bgValue, bgOverlay);
  const previewStyle: React.CSSProperties = Object.keys(computedBg).length > 0 ? computedBg : { background: "#F3F4F6" };
  const patternPreviewStyle = computePatternStyle(bgPattern);

  // Separate static vs animated gradients
  const staticGradients  = (Object.keys(GRADIENTS) as GradientKey[]).filter(k => !ANIMATED_GRADIENT_KEYS.has(k));
  const animatedGradients = (Object.keys(GRADIENTS) as GradientKey[]).filter(k => ANIMATED_GRADIENT_KEYS.has(k));

  if (loading) return (
    <div className={styles.container}>
      <div className={styles.editorPane}>
        <div className={styles.pageHead}>
          <div className={styles.headLeft}>
            <Link href="/dashboard/design" className={styles.backBtn}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Design
            </Link>
            <h1 className={styles.title}>Background</h1>
          </div>
        </div>
        <div className={styles.tabs}>
          <div className="skeleton" style={{ flex: 1, height: 40, borderRadius: 8 }} />
          <div className="skeleton" style={{ flex: 1, height: 40, borderRadius: 8 }} />
          <div className="skeleton" style={{ flex: 1, height: 40, borderRadius: 8 }} />
        </div>
        <div className={styles.gradientGrid}>
          {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 8 }} />)}
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.container}>
      <div className={styles.editorPane}>
        {/* ── HEADER ── */}
        <header className={styles.pageHead}>
          <div className={styles.headLeft}>
            <Link href="/dashboard/design" className={styles.backBtn}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Design
            </Link>
            <h1 className={styles.title}>Background</h1>
          </div>
        </header>

        {/* ── CURRENT PREVIEW ── */}
        <div className={styles.previewCard}>
          <div className={styles.previewSwatch} style={{ ...previewStyle, ...patternPreviewStyle }}>
            {bgType === "default" && <span className={styles.previewDefaultLabel}>Dari tema</span>}
          </div>
          <div className={styles.previewInfo}>
            <strong className={styles.previewLabel}>
              {bgType === "default"         && "Default (dari tema)"}
              {bgType === "solid"           && `Warna solid`}
              {bgType === "gradient"        && (bgValue ? GRADIENTS[bgValue as GradientKey]?.label : "Gradient")}
              {bgType === "custom-gradient" && "Gradient custom"}
              {bgType === "image"           && "Custom image"}
            </strong>
            <span className={styles.previewSub}>
              {bgType === "default"         && "Mengikuti background tema yang dipilih"}
              {bgType === "solid"           && bgValue}
              {bgType === "gradient"        && (ANIMATED_GRADIENT_KEYS.has(bgValue) ? "✦ Animasi bergerak" : "Gradient preset")}
              {bgType === "custom-gradient" && "Gradient buatan kamu"}
              {bgType === "image"           && "Foto custom yang kamu upload"}
            </span>
          </div>
          {bgType !== "default" && (
            <button className={styles.removeBtn} onClick={resetToDefault} disabled={isPending}>
              Hapus
            </button>
          )}
        </div>

        {/* ── TABS ── */}
        <div className={styles.tabs}>
          <button className={styles.tabBtn + (activeTab === "gradient" ? " " + styles.tabActive : "")} onClick={() => setActiveTab("gradient")}>Gradient</button>
          <button className={styles.tabBtn + (activeTab === "solid"    ? " " + styles.tabActive : "")} onClick={() => setActiveTab("solid")}>Warna</button>
          <button className={styles.tabBtn + (activeTab === "image"    ? " " + styles.tabActive : "")} onClick={() => setActiveTab("image")}>Gambar</button>
        </div>

        {/* ── TAB CONTENT: IMAGE ── */}
        {activeTab === "image" && (
          <>
            <section className={styles.section} style={{ animation: "slide-up 300ms ease both" }}>
              <div className={styles.sectionHead}>
                <h2 className={styles.sectionTitle}>Custom image</h2>
              </div>

              {/* Sub-tabs: Upload vs URL */}
              <div className={styles.imageModeToggle}>
                <button
                  className={styles.imageModeBtn + (imageMode === "upload" ? " " + styles.imageModeBtnActive : "")}
                  onClick={() => setImageMode("upload")}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                  </svg>
                  Upload File
                </button>
                <button
                  className={styles.imageModeBtn + (imageMode === "url" ? " " + styles.imageModeBtnActive : "")}
                  onClick={() => setImageMode("url")}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
                    <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
                  </svg>
                  Link URL
                </button>
              </div>

              {/* Active image preview */}
              {bgType === "image" && bgValue && (
                <div className={styles.imagePreview}>
                  <div className={styles.imageThumb} style={computeBgStyle("image", bgValue, bgOverlay)}>
                    {!bgValue.startsWith("/uploads/") && (
                      <span className={styles.imageSourceBadge}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
                          <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
                        </svg>
                        Link eksternal
                      </span>
                    )}
                  </div>
                  <div className={styles.imageActions}>
                    <button className="btn btn-ghost btn-sm" onClick={() => { setImageMode("upload"); fileRef.current?.click(); }} disabled={uploading}>
                      {uploading ? "Uploading…" : "Ganti via Upload"}
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setImageMode("url")}>
                      Ganti via Link
                    </button>
                  </div>
                </div>
              )}

              {/* Upload mode */}
              {imageMode === "upload" && !(bgType === "image" && bgValue) && (
                <button
                  className={styles.uploadZone}
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  aria-label="Upload gambar background"
                >
                  {uploading ? (
                    <><div className="spinner" style={{borderTopColor:"var(--accent)"}} /><span>Uploading…</span></>
                  ) : (
                    <>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                      </svg>
                      <span>Klik atau drag foto kesini</span>
                      <span className={styles.uploadHint}>JPG, PNG, WebP • Max 5 MB</span>
                    </>
                  )}
                </button>
              )}

              {/* URL mode */}
              {imageMode === "url" && (
                <div className={styles.urlInputWrap}>
                  <div className={styles.urlInputRow}>
                    <span className={styles.urlInputIcon}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
                        <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
                      </svg>
                    </span>
                    <input
                      type="url"
                      value={urlInput}
                      onChange={e => { setUrlInput(e.target.value); setUrlError(""); }}
                      onKeyDown={e => e.key === "Enter" && applyImageUrl()}
                      placeholder="https://images.unsplash.com/..."
                      className={styles.urlInput + (urlError ? " " + styles.urlInputError : "")}
                      aria-label="URL gambar background"
                    />
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={applyImageUrl}
                      disabled={isPending || !urlInput.trim()}
                    >
                      {isPending ? <span className="spinner" /> : null}
                      Terapkan
                    </button>
                  </div>
                  {urlError && <p className={styles.urlErrorMsg}>{urlError}</p>}
                  <p className={styles.urlHint}>
                    Gunakan link gambar langsung (berakhiran .jpg, .png, atau .webp).<br/>
                    Contoh: Unsplash, Pexels, ImgBB, atau hosting gambar lainnya.
                  </p>
                </div>
              )}

              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className={styles.fileInput} onChange={handleImageUpload} />
            </section>

            {bgType === "image" && bgValue && (
              <section className={styles.section} style={{ animation: "slide-up 400ms ease both" }}>
                <div className={styles.sectionHead}>
                  <h2 className={styles.sectionTitle}>Kecerahan (Overlay)</h2>
                  <span className={styles.overlayValue}>
                    {bgOverlay === 0 ? "Normal" : bgOverlay > 0 ? `Gelap ${Math.round(bgOverlay * 100)}%` : `Terang ${Math.round(Math.abs(bgOverlay) * 100)}%`}
                  </span>
                </div>
                <p className={styles.sectionDesc}>Sesuaikan agar teks VioLink kamu tetap mudah dibaca.</p>
                <div className={styles.sliderWrap}>
                  <input
                    type="range" min={-70} max={70} step={5}
                    value={Math.round(bgOverlay * 100)}
                    onChange={e => handleOverlayChange(Number(e.target.value) / 100)}
                    className={styles.slider}
                    aria-label="Kecerahan (Overlay)"
                  />
                  <div className={styles.sliderTicks}>
                    <span>Terang (Kiri)</span>
                    <span>Gelap (Kanan)</span>
                  </div>
                </div>
              </section>
            )}

            {bgType === "image" && bgValue && (
              <section className={styles.section} style={{ animation: "slide-up 400ms ease .1s both" }}>
                <div className={styles.sectionHead}>
                  <h2 className={styles.sectionTitle}>Effect</h2>
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  {(["none", "blur"] as const).map(fx => (
                    <button
                      key={fx}
                      onClick={() => { setBgEffect(fx); save(bgType, bgValue, bgOverlay, fx); }}
                      style={{
                        flex: 1, padding: "14px 10px",
                        border: bgEffect === fx ? "2px solid var(--ink)" : "1px solid var(--line-mid)",
                        borderRadius: "var(--r-lg)",
                        background: bgEffect === fx ? "rgba(0,0,0,0.04)" : "var(--surface)",
                        cursor: "pointer",
                        display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
                        transition: "all 150ms ease",
                      }}
                    >
                      {fx === "none" ? (
                        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                          <circle cx="14" cy="14" r="10" stroke="currentColor" strokeWidth="1.6"/>
                          <line x1="6" y1="6" x2="22" y2="22" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                        </svg>
                      ) : (
                        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                          <circle cx="14" cy="14" r="8" stroke="currentColor" strokeWidth="1.6" strokeDasharray="2 3"/>
                          <circle cx="14" cy="14" r="4" fill="currentColor" opacity="0.4"/>
                          <circle cx="14" cy="14" r="11" stroke="currentColor" strokeWidth="1" opacity="0.2"/>
                        </svg>
                      )}
                      <span style={{ fontSize: "var(--text-sm)", fontWeight: 600, textTransform: "capitalize", color: "var(--ink)" }}>
                        {fx === "none" ? "None" : "Blur"}
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {/* ── TAB CONTENT: GRADIENT ── */}
        {activeTab === "gradient" && (
          <>
            {/* Static presets */}
            <section className={styles.section}>
              <div className={styles.sectionHead}>
                <h2 className={styles.sectionTitle}>Preset</h2>
              </div>
              <div className={styles.gradientGrid}>
                {staticGradients.map((key, idx) => (
                  <GradientSwatch
                    key={key} id={key}
                    active={bgType === "gradient" && bgValue === key}
                    delay={idx * 30}
                    onClick={() => selectGradient(key)}
                  />
                ))}
              </div>
            </section>

            {/* Animated presets */}
            <section className={styles.section}>
              <div className={styles.sectionHead}>
                <h2 className={styles.sectionTitle}>✦ Live / Animasi</h2>
              </div>
              <p className={styles.sectionDesc}>Gradient yang bergerak perlahan dan halus di halaman publik kamu.</p>
              <div className={styles.gradientGrid}>
                {animatedGradients.map((key, idx) => (
                  <GradientSwatch
                    key={key} id={key}
                    active={bgType === "gradient" && bgValue === key}
                    delay={idx * 40}
                    onClick={() => selectGradient(key)}
                  />
                ))}
              </div>
            </section>

            {/* Custom Gradient Builder */}
            <section className={styles.section}>
              <div className={styles.sectionHead}>
                <h2 className={styles.sectionTitle}>Buat Sendiri</h2>
              </div>
              <p className={styles.sectionDesc}>Pilih 2 warna dan arah gradientmu sendiri.</p>
              <div className={styles.gradientBuilder}>
                {/* Live preview */}
                <div
                  className={styles.gradientBuilderPreview}
                  style={{ background: `linear-gradient(${gradAngle}deg, ${gradColor1}, ${gradColor2})` }}
                />
                {/* Color pickers */}
                <div className={styles.gradientBuilderColors}>
                  <label className={styles.colorPickerLabel}>
                    <span>Warna 1</span>
                    <div className={styles.colorPickerWrap}>
                      <input
                        type="color" value={gradColor1}
                        onChange={e => setGradColor1(e.target.value)}
                        className={styles.colorPickerInput}
                        id="grad-color1"
                      />
                      <span className={styles.colorPickerHex}>{gradColor1}</span>
                    </div>
                  </label>
                  <label className={styles.colorPickerLabel}>
                    <span>Warna 2</span>
                    <div className={styles.colorPickerWrap}>
                      <input
                        type="color" value={gradColor2}
                        onChange={e => setGradColor2(e.target.value)}
                        className={styles.colorPickerInput}
                        id="grad-color2"
                      />
                      <span className={styles.colorPickerHex}>{gradColor2}</span>
                    </div>
                  </label>
                </div>
                {/* Angle presets */}
                <div className={styles.gradientAngles}>
                  {[
                    { angle: 0,   label: "↑" },
                    { angle: 45,  label: "↗" },
                    { angle: 90,  label: "→" },
                    { angle: 135, label: "↘" },
                    { angle: 180, label: "↓" },
                  ].map(({ angle, label }) => (
                    <button
                      key={angle}
                      className={styles.angleBtn + (gradAngle === angle ? " " + styles.angleBtnActive : "")}
                      onClick={() => setGradAngle(angle)}
                      title={`${angle}°`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <button className="btn btn-primary btn-sm" onClick={applyCustomGradient} disabled={isPending}>
                  {isPending ? <span className="spinner" /> : null}
                  Terapkan Gradient
                </button>
              </div>
            </section>
          </>
        )}

        {/* ── TAB CONTENT: SOLID COLOR ── */}
        {activeTab === "solid" && (
          <>
            <section className={styles.section}>
              <div className={styles.sectionHead}>
                <h2 className={styles.sectionTitle}>Preset</h2>
              </div>
              <div className={styles.colorGrid}>
                {SOLID_COLORS.map((c, idx) => (
                  <ColorSwatch
                    key={c.hex} hex={c.hex} label={c.label}
                    active={bgType === "solid" && bgValue === c.hex}
                    delay={idx * 20}
                    onClick={() => selectSolid(c.hex)}
                  />
                ))}
              </div>
            </section>

            {/* Custom Hex Color Picker */}
            <section className={styles.section}>
              <div className={styles.sectionHead}>
                <h2 className={styles.sectionTitle}>Warna Custom</h2>
              </div>
              <p className={styles.sectionDesc}>Pilih warna apapun menggunakan color picker atau ketik kode hex-nya.</p>
              <div className={styles.customColorWrap}>
                <div className={styles.customColorPreview} style={{ background: customHex }} />
                <input
                  type="color"
                  value={customHex}
                  onChange={e => { setCustomHex(e.target.value); setHexInput(e.target.value); }}
                  className={styles.customColorNativePicker}
                  id="custom-color-picker"
                  aria-label="Pilih warna"
                />
                <input
                  type="text"
                  value={hexInput}
                  onChange={e => {
                    setHexInput(e.target.value);
                    if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) setCustomHex(e.target.value);
                  }}
                  placeholder="#7C3AED"
                  className={styles.hexInput}
                  maxLength={7}
                  aria-label="Kode hex warna"
                />
                <button className="btn btn-primary btn-sm" onClick={applyCustomColor} disabled={isPending}>
                  Terapkan
                </button>
              </div>
            </section>
          </>
        )}

        {/* ── PATTERN OVERLAY ── shown when any non-default bg is active */}
        {bgType !== "default" && (
          <section className={styles.section} style={{ animation: "slide-up 300ms ease both" }}>
            <div className={styles.sectionHead}>
              <h2 className={styles.sectionTitle}>Pattern Overlay</h2>
            </div>
            <p className={styles.sectionDesc}>Tambahkan pola di atas background untuk tampilan yang lebih bertekstur.</p>
            <div className={styles.patternGrid}>
              {(Object.entries(PATTERNS) as [PatternKey, { label: string; icon: string; css?: string }][]).map(([key, p]) => (
                <button
                  key={key}
                  className={styles.patternBtn + (bgPattern === key ? " " + styles.patternBtnActive : "")}
                  onClick={() => handlePatternChange(key)}
                  aria-pressed={bgPattern === key}
                >
                  <span className={styles.patternIcon}>{p.icon}</span>
                  <span className={styles.patternLabel}>{p.label}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        <p className={styles.hint}>Perubahan langsung diterapkan ke halaman publik kamu.</p>
      </div>
      <div className="toast-portal">{toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}</div>
    </div>
  );
}

"use client";

import { useState } from "react";
import styles from "./landing.module.css";
import { slugify } from "@/lib/utils";
import { ScrollReveal } from "./ScrollReveal";
import { motion } from "framer-motion";

interface HeroSectionProps {
  onOpenAuth?: (tab: "login" | "register", slug?: string) => void;
}

export function HeroSection({ onOpenAuth }: HeroSectionProps) {
  const [handle, setHandle] = useState("");

  const handleClaim = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = slugify(handle);
    onOpenAuth?.("register", clean);
  };

  return (
    <section className={styles.hero}>
      {/* LEFT: TEXT CONTENT & CLAIM FORM */}
      <div className={styles.heroContent}>
        <ScrollReveal delay={0} direction="up">
          <div className={styles.heroBadge}>
            <span className={styles.heroBadgeDot} />
            <span>Platform VioLink Terestetik & Modern</span>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={100} direction="up">
          <h1 className={styles.heroTitle}>
            Satu Link untuk Seluruh{" "}
            <span className={styles.heroTitleSerif}>Dunia Digitalmu</span>
          </h1>
        </ScrollReveal>

        <ScrollReveal delay={200} direction="up">
          <p className={styles.heroSub}>
            Tampilkan sosial media, portofolio, dan tokomu dalam satu halaman berteknologi 
            Glassmorphism, Animated Gradient, dan Analitik Real-time.
          </p>
        </ScrollReveal>

        {/* CLAIM USERNAME FORM */}
        <ScrollReveal delay={300} direction="up">
          <form onSubmit={handleClaim} className={styles.claimForm}>
            <div className={styles.claimInputWrap}>
              <div className={styles.claimFieldBox}>
                <span className={styles.claimPrefix}>violink.space/</span>
                <input
                  type="text"
                  value={handle}
                  onChange={e => setHandle(e.target.value)}
                  placeholder="nama-kamu"
                  className={styles.claimInput}
                  maxLength={24}
                  aria-label="Klaim username kamu"
                />
              </div>
              <button type="submit" className={styles.claimSubmitBtn}>
                Klaim Link
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2.5 7h9M8.5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <span className={styles.claimHint}>Gratis selamanya. Tanpa kartu kredit.</span>
          </form>
        </ScrollReveal>

        {/* SOCIAL PROOF */}
        <ScrollReveal delay={400} direction="up">
          <div className={styles.socialProof}>
            <div className={styles.avatarStack}>
              <span className={styles.avatarStackImg} style={{ background: "#E95F8A", color: "#fff", fontSize: "0.65rem", fontWeight: 800, display: "grid", placeItems: "center" }}>BL</span>
              <span className={styles.avatarStackImg} style={{ background: "#7C3AED", color: "#fff", fontSize: "0.65rem", fontWeight: 800, display: "grid", placeItems: "center" }}>AR</span>
              <span className={styles.avatarStackImg} style={{ background: "#06B6D4", color: "#fff", fontSize: "0.65rem", fontWeight: 800, display: "grid", placeItems: "center" }}>RN</span>
              <span className={styles.avatarStackImg} style={{ background: "#FF6B35", color: "#fff", fontSize: "0.65rem", fontWeight: 800, display: "grid", placeItems: "center" }}>SY</span>
            </div>
            <span className={styles.proofText}>
              Dipercaya oleh <strong>1,000+</strong> kreator & profesional
            </span>
          </div>
        </ScrollReveal>
      </div>

      {/* RIGHT: PHONE MOCKUP WITH FLOATING WIDGET BADGES */}
      <div className={styles.heroVisual}>
        {/* FLOATING BADGE 1 (TOP LEFT) */}
        <motion.div
          initial={{ opacity: 0, x: -20, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1, y: [0, -8, 0] }}
          transition={{
            opacity: { duration: 0.6, delay: 0.4 },
            x: { duration: 0.6, delay: 0.4 },
            y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
          }}
          className={styles.heroFloatingBadgeLeft}
        >
          <div className={styles.heroBadgeIconLeft}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
              <polyline points="17 6 23 6 23 12"/>
            </svg>
          </div>
          <div className={styles.heroBadgeTextWrap}>
            <span className={styles.heroBadgeTitle}>Total Pengunjung</span>
            <span className={styles.heroBadgeVal}>12,480 Views ↗</span>
          </div>
        </motion.div>

        {/* FLOATING BADGE 2 (BOTTOM RIGHT) */}
        <motion.div
          initial={{ opacity: 0, x: 20, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1, y: [0, 8, 0] }}
          transition={{
            opacity: { duration: 0.6, delay: 0.6 },
            x: { duration: 0.6, delay: 0.6 },
            y: { duration: 4.5, repeat: Infinity, ease: "easeInOut" },
          }}
          className={styles.heroFloatingBadgeRight}
        >
          <div className={styles.heroBadgeIconRight}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </div>
          <div className={styles.heroBadgeTextWrap}>
            <span className={styles.heroBadgeTitle}>Desain Frosted</span>
            <span className={styles.heroBadgeValRight}>100% Estetik</span>
          </div>
        </motion.div>

        <ScrollReveal delay={200} direction="up">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          >
            {/* Smartphone Frame */}
            <div className={styles.phoneFrame}>
              <div className={styles.phoneNotch} />
              
              {/* Phone Screen Container */}
              <div className={styles.phoneScreen}>
                {/* Top Share Icon */}
                <div className={styles.phoneShareBtn} aria-label="Share">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                  </svg>
                </div>

                {/* Avatar inside phone */}
                <div className={styles.phoneAvatarWrap}>
                  <div
                    className={styles.phoneAvatarCore}
                    style={{
                      background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
                      color: "#FFFFFF",
                    }}
                  >
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                </div>

                {/* Identity */}
                <div className={styles.phoneName}>VioLink Studio</div>
                <div className={styles.phoneBio}>Kreator Digital & Strategis Konten</div>

                {/* Social Icons Row */}
                <div className={styles.phoneSocialRow}>
                  {/* Instagram */}
                  <span className={styles.phoneSocialIcon} style={{ background: "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                    </svg>
                  </span>
                  {/* TikTok */}
                  <span className={styles.phoneSocialIcon} style={{ background: "#000000", border: "1px solid rgba(255,255,255,0.3)" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff">
                      <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.394 6.394 0 0 0-5.396 7.408 6.394 6.394 0 0 0 7.412 5.395A6.394 6.394 0 0 0 15.82 15.8V9.112a8.214 8.214 0 0 0 4.77 1.519V7.185a4.795 4.795 0 0 1-1.001-.499z"/>
                    </svg>
                  </span>
                  {/* WhatsApp */}
                  <span className={styles.phoneSocialIcon} style={{ background: "#25D366" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                    </svg>
                  </span>
                </div>

                {/* Links inside phone (Glass Frosted Pill Buttons) */}
                <div className={styles.phoneLinks}>
                  <div className={styles.phoneGlassLink} style={{ backdropFilter: "blur(20px) saturate(180%)", WebkitBackdropFilter: "blur(20px) saturate(180%)", background: "rgba(255, 255, 255, 0.22)", border: "1.5px solid rgba(255, 255, 255, 0.45)" }}>
                    <span className={styles.phoneLinkIconBadge} style={{ background: "#4F46E5" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                        <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
                      </svg>
                    </span>
                    <span className={styles.phoneLinkTitle}>Portofolio & Project Kami</span>
                    <span className={styles.phoneLinkArrow}>→</span>
                  </div>

                  <div className={styles.phoneGlassLink} style={{ backdropFilter: "blur(20px) saturate(180%)", WebkitBackdropFilter: "blur(20px) saturate(180%)", background: "rgba(255, 255, 255, 0.22)", border: "1.5px solid rgba(255, 255, 255, 0.45)" }}>
                    <span className={styles.phoneLinkIconBadge} style={{ background: "#EC4899" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
                      </svg>
                    </span>
                    <span className={styles.phoneLinkTitle}>Toko Online & Katalog E-Book</span>
                    <span className={styles.phoneLinkArrow}>→</span>
                  </div>

                  <div className={styles.phoneGlassLink} style={{ backdropFilter: "blur(20px) saturate(180%)", WebkitBackdropFilter: "blur(20px) saturate(180%)", background: "rgba(255, 255, 255, 0.22)", border: "1.5px solid rgba(255, 255, 255, 0.45)" }}>
                    <span className={styles.phoneLinkIconBadge} style={{ background: "#8B5CF6" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                      </svg>
                    </span>
                    <span className={styles.phoneLinkTitle}>Konsultasi Strategi Konten 1-on-1</span>
                    <span className={styles.phoneLinkArrow}>→</span>
                  </div>

                  <div className={styles.phoneGlassLink} style={{ backdropFilter: "blur(20px) saturate(180%)", WebkitBackdropFilter: "blur(20px) saturate(180%)", background: "rgba(255, 255, 255, 0.22)", border: "1.5px solid rgba(255, 255, 255, 0.45)" }}>
                    <span className={styles.phoneLinkIconBadge} style={{ background: "#06B6D4" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                      </svg>
                    </span>
                    <span className={styles.phoneLinkTitle}>Hubungi via Email / Inquiry</span>
                    <span className={styles.phoneLinkArrow}>→</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </ScrollReveal>
      </div>
    </section>
  );
}

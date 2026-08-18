"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./landing.module.css";
import { ScrollReveal } from "./ScrollReveal";

export function FeatureGrid() {
  const [viewsCount, setViewsCount] = useState(0);
  const [scoreCount, setScoreCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [activeColor, setActiveColor] = useState(0);
  const [activeRadius, setActiveRadius] = useState("pill");
  const sectionRef = useRef<HTMLDivElement>(null);

  const colors = [
    "linear-gradient(-45deg, #4F46E5, #ec4899, #8b5cf6, #06b6d4)",
    "linear-gradient(-45deg, #EC4899, #F43F5E, #FB923C, #FACC15)",
    "linear-gradient(-45deg, #8B5CF6, #6366F1, #3B82F6, #60A5FA)",
    "linear-gradient(-45deg, #06B6D4, #10B981, #34D399, #A7F3D0)",
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);

          // Animate Views count up to 12,480
          let startViews = 0;
          const targetViews = 12480;
          const duration = 1400;
          const stepTime = 20;
          const totalSteps = duration / stepTime;
          const increment = Math.ceil(targetViews / totalSteps);

          const viewsTimer = setInterval(() => {
            startViews += increment;
            if (startViews >= targetViews) {
              setViewsCount(targetViews);
              clearInterval(viewsTimer);
            } else {
              setViewsCount(startViews);
            }
          }, stepTime);

          // Animate Score count up to 100
          let startScore = 0;
          const targetScore = 100;
          const scoreTimer = setInterval(() => {
            startScore += 2;
            if (startScore >= targetScore) {
              setScoreCount(targetScore);
              clearInterval(scoreTimer);
            } else {
              setScoreCount(startScore);
            }
          }, 25);
        }
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated]);

  const getRadiusStyle = () => {
    if (activeRadius === "rounded") return "14px";
    if (activeRadius === "square") return "6px";
    return "999px";
  };

  return (
    <section id="features" ref={sectionRef} className={styles.section}>
      <ScrollReveal delay={0} direction="up">
        <div className={styles.sectionHeader}>
          <span className={styles.sectionEyebrow}>Kelebihan Utama</span>
          <h2 className={styles.sectionTitle}>Dirancang Khusus untuk Kreator Modern</h2>
          <p className={styles.sectionDesc}>
            Segala yang kamu butuhkan untuk membangun kehadiran digital yang profesional dan memukau dalam satu platform.
          </p>
        </div>
      </ScrollReveal>

      <div className={styles.bentoGrid}>
        {/* CARD 1: Kustomisasi Visual */}
        <ScrollReveal delay={100} direction="up" className={styles.bentoCard7}>
          <div className={`${styles.bentoCard} ${styles.bentoCard7}`}>
            <div className={styles.bentoCardHeader}>
              <h3 className={styles.bentoTitle}>Bebas Desain Sesuai Identitas Brand & Style Kamu</h3>
              <p className={styles.bentoDesc}>
                Bebas pilih background gradasi bergerak, foto sendiri, efek blur, hingga pola tekstur eksklusif.
              </p>
            </div>

            <div className={styles.uiWidgetBoxLightTheme}>
              <div className={styles.uiWidgetTopBar}>
                <span className={styles.uiWidgetTitleLight}>PEMILIH WARNA & TEMA</span>
                <div className={styles.uiColorDots}>
                  {colors.map((c, idx) => (
                    <span
                      key={idx}
                      className={`${styles.uiDot} ${activeColor === idx ? styles.uiDotActive : ""}`}
                      style={{ background: c.split(",")[1].trim() }}
                      onClick={() => setActiveColor(idx)}
                      title="Klik untuk ganti gradasi"
                    />
                  ))}
                </div>
              </div>

              {/* Live Gradient Preview Bar */}
              <div
                className={styles.uiGradientBar}
                style={{ background: colors[activeColor], backgroundSize: "300% 300%" }}
              />

              {/* Texture Selector Pills */}
              <div className={styles.uiPillsRow} style={{ marginTop: "12px" }}>
                <span className={`${styles.uiPillLight} ${styles.uiPillActiveLight}`}>● Pola Bintik</span>
                <span className={styles.uiPillLight}>Pola Garis</span>
                <span className={styles.uiPillLight}>Tekstur Halus</span>
              </div>

              {/* Background Feature Badges */}
              <div className={styles.uiBgFeatureRow} style={{ marginTop: "10px" }}>
                <span className={styles.uiBgFeatureBadge}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/>
                  </svg>
                  Gradasi Bergerak
                </span>
                <span className={styles.uiBgFeatureBadge}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#EC4899" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                  </svg>
                  Foto Kustom
                </span>
                <span className={styles.uiBgFeatureBadge}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                  Frosted Blur
                </span>
                <span className={styles.uiBgFeatureBadge}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#06B6D4" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                  </svg>
                  Pola Tekstur
                </span>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* CARD 2: Button Styles & Shape Freedom */}
        <ScrollReveal delay={220} direction="up" className={styles.bentoCard5}>
          <div className={`${styles.bentoCard} ${styles.bentoCard5}`}>
            <div className={styles.bentoCardHeader}>
              <h3 className={styles.bentoTitle}>Bentuk, Warna, & Gaya Tombol Tanpa Batas</h3>
              <p className={styles.bentoDesc}>
                Pilih gaya tombol kaca, solid, atau outline. Atur warna kustom dan bentuk sudutnya secara fleksibel.
              </p>
            </div>

            <div className={styles.uiWidgetBoxLightTheme}>
              <div className={styles.uiWidgetTopBar} style={{ marginBottom: "12px" }}>
                <span className={styles.uiWidgetTitleLight}>PRATINJAU BENTUK & LEKUKAN TOMBOL</span>
              </div>

              {/* Glass button with dynamic border radius */}
              <div
                className={styles.uiGlassButtonDemoLight}
                style={{ borderRadius: getRadiusStyle() }}
              >
                <div className={styles.uiGlassIconBadgeLight}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                </div>
                <span className={styles.uiGlassTextLight}>Tautan Tombol Kustom</span>
                <span className={styles.uiGlassArrowLight}>→</span>
              </div>

              <div className={styles.uiRadiusRow}>
                <span
                  className={`${styles.uiPillLight} ${activeRadius === "pill" ? styles.uiPillActiveLight : ""}`}
                  onClick={() => setActiveRadius("pill")}
                  style={{ cursor: "pointer" }}
                >
                  Kapsul
                </span>
                <span
                  className={`${styles.uiPillLight} ${activeRadius === "rounded" ? styles.uiPillActiveLight : ""}`}
                  onClick={() => setActiveRadius("rounded")}
                  style={{ cursor: "pointer" }}
                >
                  Membulat
                </span>
                <span
                  className={`${styles.uiPillLight} ${activeRadius === "square" ? styles.uiPillActiveLight : ""}`}
                  onClick={() => setActiveRadius("square")}
                  style={{ cursor: "pointer" }}
                >
                  Kotak
                </span>
              </div>

              {/* Button Style Badges */}
              <div className={styles.uiBgFeatureRow} style={{ marginTop: "10px" }}>
                <span className={styles.uiBgFeatureBadge}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                  Frosted Glass
                </span>
                <span className={styles.uiBgFeatureBadge}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="18" x="3" y="3" rx="4" fill="#059669"/>
                  </svg>
                  Solid Fill
                </span>
                <span className={styles.uiBgFeatureBadge}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#E11D48" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="18" x="3" y="3" rx="4"/>
                  </svg>
                  Outline
                </span>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* CARD 3: Analitik Real-Time */}
        <ScrollReveal delay={340} direction="up" className={styles.bentoCard5}>
          <div className={`${styles.bentoCard} ${styles.bentoCard5}`}>
            <div className={styles.bentoCardHeader}>
              <h3 className={styles.bentoTitle}>Pantau Jumlah Pengunjung & Klik Link Real-Time</h3>
              <p className={styles.bentoDesc}>
                Ketahui link mana yang paling banyak diklik dan berapa total pengunjung profil kamu setiap harinya lewat grafik laporan yang simpel.
              </p>
            </div>

            <div className={styles.uiWidgetBoxLightTheme}>
              <div className={styles.uiAnalyticsHeader}>
                <div>
                  <span className={styles.uiAnalyticsLabelLight}>TOTAL PENGUNJUNG HARIAN</span>
                  <div className={styles.uiAnalyticsValLight}>
                    {viewsCount.toLocaleString("id-ID")}
                  </div>
                </div>
                <span className={styles.uiBadgeGrowth}>+18.4% ↗</span>
              </div>

              {/* Vector Bar Chart with Rising Animation */}
              <div className={styles.uiBarChart}>
                {[35, 60, 45, 75, 60, 100].map((h, i) => (
                  <div key={i} className={styles.uiBarCol}>
                    <div
                      className={i === 5 ? styles.uiBarActive : styles.uiBarLight}
                      style={{
                        height: hasAnimated ? `${h}%` : "0%",
                        transition: `height 750ms cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 90}ms`,
                      }}
                    />
                    <span className={i === 5 ? styles.uiDayTextActive : styles.uiDayTextLight}>
                      {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab"][i]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* CARD 4: Super Cepat & SEO */}
        <ScrollReveal delay={460} direction="up" className={styles.bentoCard7}>
          <div className={`${styles.bentoCard} ${styles.bentoCardDark} ${styles.bentoCard7}`}>
            <div className={styles.bentoCardHeader}>
              <h3 className={`${styles.bentoTitle} ${styles.bentoTitleDark}`}>Super Cepat Ditingkat Milidetik & Rapi di Media Sosial</h3>
              <p className={`${styles.bentoDesc} ${styles.bentoDescDark}`}>
                Halaman profil kamu memuat secara instan tanpa membuat pengunjung menunggu. Otomatis menampilkan pratinjau gambar yang indah saat link dibagikan di WhatsApp & Instagram.
              </p>
            </div>

            <div className={styles.uiSeoWidgetDirect}>
              <div className={styles.uiLighthouseCircle}>
                <span className={styles.uiScoreNum}>{scoreCount}</span>
                <span className={styles.uiScoreSub}>SKOR</span>
              </div>

              <div className={styles.uiSeoContent}>
                <div className={styles.uiSeoMetricsRow}>
                  <div className={styles.uiMetricBadgeDark}><span className={styles.uiMetricValDark}>0.4s</span><span className={styles.uiMetricNameDark}>Muat Cepat</span></div>
                  <div className={styles.uiMetricBadgeDark}><span className={styles.uiMetricValDark}>100%</span><span className={styles.uiMetricNameDark}>Responsif</span></div>
                  <div className={styles.uiMetricBadgeDark}><span className={styles.uiMetricValDark}>Verifikasi</span><span className={styles.uiMetricNameDark}>Google</span></div>
                </div>
                <div className={styles.uiSeoList}>
                  <div className={styles.uiSeoItem}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    <span>Kecepatan Muat Instan 100% Tanpa Menunggu Loading</span>
                  </div>
                  <div className={styles.uiSeoItem}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    <span>Pratinjau Kartu Link Otomatis di WhatsApp, IG & Facebook</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

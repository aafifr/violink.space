import styles from "./landing.module.css";
import { ScrollReveal } from "./ScrollReveal";

const THEMES = [
  {
    name: "Aurora Glass",
    tag: "Popular",
    bg: "linear-gradient(135deg, #1E1040 0%, #0D1B4B 50%, #1B4332 100%)",
    glass: true,
    initials: "AG",
    user: "@aurora.studio",
    btnBg: "rgba(255,255,255,0.18)",
    btnBorder: "rgba(255,255,255,0.3)",
    textColor: "#FFFFFF",
  },
  {
    name: "Clean Dark",
    tag: "Minimalist",
    bg: "#0A0A0B",
    glass: false,
    initials: "CD",
    user: "@alex.dev",
    btnBg: "#1C1C1E",
    btnBorder: "rgba(255,255,255,0.12)",
    textColor: "#FFFFFF",
  },
  {
    name: "Frosted Rose",
    tag: "Elegant",
    bg: "linear-gradient(135deg, #2D0A1E 0%, #7B2D8B 50%, #E95F8A 100%)",
    glass: true,
    initials: "FR",
    user: "@rose.design",
    btnBg: "rgba(255,255,255,0.22)",
    btnBorder: "rgba(255,255,255,0.4)",
    textColor: "#FFFFFF",
  },
  {
    name: "Neobrutalism",
    tag: "Trendy",
    bg: "#FFF0F5",
    glass: false,
    initials: "NB",
    user: "@retro.vibes",
    btnBg: "#FF4500",
    btnBorder: "#000000",
    textColor: "#FFFFFF",
    isBrutal: true,
  },
];

export function ThemeShowcase() {
  return (
    <section id="themes" className={styles.section}>
      <ScrollReveal delay={0} direction="up">
        <div className={styles.sectionHeader}>
          <span className={styles.sectionEyebrow}>Galeri Desain</span>
          <h2 className={styles.sectionTitle}>Pilih Tema Sesuai Identitasmu</h2>
          <p className={styles.sectionDesc}>
            Ubah suasana halaman profil kamu secara instan dengan koleksi tema estetik yang telah dikurasi secara profesional.
          </p>
        </div>
      </ScrollReveal>

      <div className={styles.themeGrid}>
        {THEMES.map((t, i) => (
          <ScrollReveal key={i} delay={i * 120} direction="up">
            <div className={styles.themeCard}>
              {/* Realistic Mini Preview Mockup */}
              <div className={styles.themeCardPreview} style={{ background: t.bg }}>
                {/* Mini Avatar */}
                <div
                  className={styles.themePreviewAvatar}
                  style={{
                    background: t.isBrutal ? "#FF4500" : "rgba(255,255,255,0.25)",
                    color: t.textColor,
                    border: t.isBrutal ? "2px solid #000" : "2px solid rgba(255,255,255,0.5)",
                  }}
                >
                  {t.initials}
                </div>

                <div className={styles.themePreviewUser} style={{ color: t.isBrutal ? "#000" : t.textColor }}>
                  {t.user}
                </div>

                {/* Mini Links */}
                <div
                  className={styles.themePreviewLink}
                  style={{
                    background: t.btnBg,
                    border: `1px solid ${t.btnBorder}`,
                    boxShadow: t.isBrutal ? "2px 2px 0px #000" : "none",
                    color: t.textColor,
                  }}
                >
                  <span>🎵 Music Stream</span>
                </div>
                <div
                  className={styles.themePreviewLink}
                  style={{
                    background: t.btnBg,
                    border: `1px solid ${t.btnBorder}`,
                    boxShadow: t.isBrutal ? "2px 2px 0px #000" : "none",
                    color: t.textColor,
                    width: "82%",
                  }}
                >
                  <span>📸 Instagram</span>
                </div>
              </div>

              {/* Footer label */}
              <div className={styles.themeCardBody}>
                <span className={styles.themeName}>{t.name}</span>
                <span className={styles.themeTag}>{t.tag}</span>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}

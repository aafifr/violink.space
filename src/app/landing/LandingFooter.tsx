import Image from "next/image";
import styles from "./landing.module.css";
import { ScrollReveal } from "./ScrollReveal";

interface LandingFooterProps {
  onOpenAuth?: (tab: "login" | "register") => void;
}

export function LandingFooter({ onOpenAuth }: LandingFooterProps) {
  return (
    <>
      {/* BOTTOM CTA BANNER */}
      <ScrollReveal delay={0} direction="up">
        <div className={styles.ctaBanner}>
          <div className={styles.ctaBannerGlow} />
          <h2 className={styles.ctaBannerTitle}>
            Siap Membuat Halaman VioLink Impianmu?
          </h2>
          <p className={styles.ctaBannerSub}>
            Bergabunglah dengan ribuan kreator & profesional yang sudah menggunakan VioLink Studio.
          </p>
          <button
            type="button"
            className={styles.ctaBannerBtn}
            onClick={() => onOpenAuth?.("register")}
            style={{ border: "none", cursor: "pointer" }}
          >
            Buat Gratis Sekarang
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </ScrollReveal>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.footerContainer}>
          <div className={styles.brand}>
            <Image
              src="/images/logo.png"
              alt="VioLink Studio"
              width={28}
              height={28}
              className={styles.brandLogo}
            />
            <span className={styles.brandName}>VioLink Studio</span>
          </div>

          <div className={styles.footerCopy}>
            © {new Date().getFullYear()} VioLink Studio. All rights reserved.
          </div>
        </div>
      </footer>
    </>
  );
}

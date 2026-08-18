"use client";

import Link from "next/link";
import Image from "next/image";
import styles from "./landing.module.css";

interface LandingHeaderProps {
  onOpenAuth?: (tab: "login" | "register") => void;
}

export function LandingHeader({ onOpenAuth }: LandingHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.headerContainer}>
        {/* BRAND */}
        <Link href="/" className={styles.brand}>
          <Image
            src="/images/logo.png"
            alt="VioLink Studio"
            width={34}
            height={34}
            className={styles.brandLogo}
            priority
          />
          <span className={styles.brandName}>VioLink Studio</span>
        </Link>

        {/* NAVIGATION LINKS */}
        <nav className={styles.navLinks} aria-label="Main Navigation">
          <a href="#features" className={styles.navLink}>Fitur</a>
          <a href="#how-it-works" className={styles.navLink}>Cara Kerja</a>
          <a href="#faq" className={styles.navLink}>FAQ</a>
        </nav>

        {/* ACTIONS */}
        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.signInBtn}
            onClick={() => onOpenAuth?.("login")}
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            Masuk
          </button>
          <button
            type="button"
            className={styles.ctaBtn}
            onClick={() => onOpenAuth?.("register")}
            style={{ border: "none", cursor: "pointer" }}
          >
            Buat Gratis
          </button>
        </div>
      </div>
    </header>
  );
}

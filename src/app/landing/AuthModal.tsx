"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./landing.module.css";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "login" | "register";
  claimedSlug?: string;
}

export function AuthModal({
  isOpen,
  onClose,
  initialTab = "login",
  claimedSlug = "",
}: AuthModalProps) {
  const router = useRouter();
  const [tab, setTab] = useState<"login" | "register">(initialTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setTab(initialTab);
    setError("");
  }, [initialTab, isOpen]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const endpoint = tab === "login" ? "/api/auth/login" : "/api/auth/register";

    startTransition(async () => {
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Gagal melakukan autentikasi");
          return;
        }
        if (data.onboarded === false) {
          const target = claimedSlug
            ? `/onboarding?slug=${encodeURIComponent(claimedSlug)}`
            : "/onboarding";
          router.push(target);
        } else {
          router.push("/dashboard");
        }
      } catch (err) {
        setError("Terjadi kesalahan jaringan. Coba lagi.");
      }
    });
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className={styles.modalOverlay} onClick={onClose}>
          {/* Backdrop Blur Fade */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.modalBackdrop}
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className={styles.modalCard}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              className={styles.modalCloseBtn}
              onClick={onClose}
              aria-label="Tutup Popup"
            >
              ✕
            </button>

            {/* Brand Header */}
            <div className={styles.modalBrandHeader}>
              <Image
                src="/images/logo.png"
                alt="VioLink Studio"
                width={36}
                height={36}
                className={styles.modalLogo}
                priority
              />
              <span className={styles.modalBrandName}>VioLink Studio</span>
            </div>

            {claimedSlug && tab === "register" && (
              <div className={styles.claimedSlugNotice}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2.5" style={{ display: "inline-block", verticalAlign: "middle", marginRight: 6 }}>
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                Kamu akan mengklaim username <strong>violink.space/{claimedSlug}</strong>
              </div>
            )}

            {/* Tab Switcher */}
            <div className={styles.modalTabList}>
              <button
                type="button"
                className={`${styles.modalTab} ${tab === "login" ? styles.modalTabActive : ""}`}
                onClick={() => {
                  setTab("login");
                  setError("");
                }}
              >
                Masuk
              </button>
              <button
                type="button"
                className={`${styles.modalTab} ${tab === "register" ? styles.modalTabActive : ""}`}
                onClick={() => {
                  setTab("register");
                  setError("");
                }}
              >
                Buat Akun Gratis
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className={styles.modalForm}>
              <div className={styles.modalFieldGroup}>
                <label className={styles.modalLabel} htmlFor="modal-email">
                  Alamat Email
                </label>
                <input
                  id="modal-email"
                  type="email"
                  className={styles.modalInput}
                  placeholder="nama@emailkamu.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className={styles.modalFieldGroup}>
                <label className={styles.modalLabel} htmlFor="modal-password">
                  Kata Sandi
                </label>
                <input
                  id="modal-password"
                  type="password"
                  className={styles.modalInput}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
                {tab === "register" && (
                  <span className={styles.modalHint}>Minimal 8 karakter</span>
                )}
              </div>

              {error && <div className={styles.modalErrorBox}>{error}</div>}

              <button
                type="submit"
                className={styles.modalSubmitBtn}
                disabled={isPending}
              >
                {isPending ? "Memproses..." : tab === "login" ? "Masuk Ke Dashboard" : "Daftar Akun Baru"}
              </button>
            </form>

            {/* Modal Footer Note */}
            <div className={styles.modalFooterNote}>
              {tab === "login" ? (
                <>
                  Belum punya akun?{" "}
                  <button
                    type="button"
                    className={styles.modalSwitchBtn}
                    onClick={() => {
                      setTab("register");
                      setError("");
                    }}
                  >
                    Daftar gratis di sini
                  </button>
                </>
              ) : (
                <>
                  Sudah punya akun?{" "}
                  <button
                    type="button"
                    className={styles.modalSwitchBtn}
                    onClick={() => {
                      setTab("login");
                      setError("");
                    }}
                  >
                    Masuk di sini
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

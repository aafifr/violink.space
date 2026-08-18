"use client";

import { useState } from "react";
import styles from "./landing.module.css";
import { ScrollReveal } from "./ScrollReveal";

const FAQS = [
  {
    q: "Apakah VioLink Studio benar-benar gratis?",
    a: "Ya! Kamu bisa mendaftar dan menggunakan fitur utama VioLink Studio secara gratis tanpa perlu kartu kredit.",
  },
  {
    q: "Bagaimana cara mengubah gaya tombol dan warna latar belakang?",
    a: "Cukup masuk ke dashboard kamu, pilih menu 'Design', lalu pilih warna gradasi, tekstur latar, atau gaya tombol kaca yang kamu inginkan. Perubahan langsung tersimpan otomatis.",
  },
  {
    q: "Apakah link profil saya bisa dimasukkan ke bio Instagram & TikTok?",
    a: "Tentu saja! Setelah selesai membuat profil, kamu akan mendapatkan link unik seperti violink.space/nama-kamu yang siap dipasang di bio sosial media mana pun.",
  },
  {
    q: "Bagaimana cara melihat laporan statistik jumlah pengunjung?",
    a: "Setiap klik dan kunjungan profil kamu dicatat secara otomatis. Kamu bisa memantau grafik harian dan link paling populer lewat menu 'Analytics' di dashboard.",
  },
];

export function FaqSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section id="faq" className={styles.section}>
      <ScrollReveal delay={0} direction="up">
        <div className={styles.sectionHeader}>
          <span className={styles.sectionEyebrow}>Tanya Jawab (FAQ)</span>
          <h2 className={styles.sectionTitle}>Pertanyaan yang Sering Diajukan</h2>
          <p className={styles.sectionDesc}>
            Punya pertanyaan seputar VioLink Studio? Temukan jawaban lengkapnya di bawah ini.
          </p>
        </div>
      </ScrollReveal>

      <div className={styles.faqList}>
        {FAQS.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <ScrollReveal key={idx} delay={idx * 80} direction="up">
              <div
                className={styles.faqItem + (isOpen ? " " + styles.faqItemOpen : "")}
              >
                <button
                  className={styles.faqQuestion}
                  onClick={() => toggleFaq(idx)}
                  aria-expanded={isOpen}
                >
                  <span>{faq.q}</span>
                  <span className={styles.faqIcon}>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      style={{
                        transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 200ms ease",
                      }}
                    >
                      <path
                        d="M4 6l4 4 4-4"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </button>
                {isOpen && (
                  <div className={styles.faqAnswer}>
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            </ScrollReveal>
          );
        })}
      </div>
    </section>
  );
}

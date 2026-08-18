import styles from "./landing.module.css";
import { ScrollReveal } from "./ScrollReveal";

const STEPS = [
  {
    num: "01",
    title: "Klaim Username Unik",
    desc: "Dapatkan alamat link eksklusif kamu seperti violink.space/nama-kamu dalam hitungan detik secara gratis.",
  },
  {
    num: "02",
    title: "Atur Link & Desain",
    desc: "Tambahkan tautan sosial media, pilih gaya tombol kaca glassmorphism, dan pasang background favoritmu.",
  },
  {
    num: "03",
    title: "Bagikan Ke Semua Orang",
    desc: "Pasang link baru kamu di bio Instagram, TikTok, WhatsApp, LinkedIn, dan email signature.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className={styles.section}>
      <ScrollReveal delay={0} direction="up">
        <div className={styles.sectionHeader}>
          <span className={styles.sectionEyebrow}>Langkah Sederhana</span>
          <h2 className={styles.sectionTitle}>Mulai Hanya Dalam 3 Langkah</h2>
          <p className={styles.sectionDesc}>
            Tanpa pengetahuan koding. Tanpa proses rumit. Halaman VioLink kamu siap dalam waktu kurang dari 2 menit.
          </p>
        </div>
      </ScrollReveal>

      <div className={styles.stepsGrid}>
        {STEPS.map((s, i) => (
          <ScrollReveal key={i} delay={i * 150} direction="up">
            <div className={styles.stepCard}>
              {i < 2 && <div className={styles.stepConnector} aria-hidden />}
              <span className={styles.stepNumber}>{s.num}</span>
              <h3 className={styles.stepTitle}>{s.title}</h3>
              <p className={styles.stepDesc}>{s.desc}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}

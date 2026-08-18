<div align="center">
  <img src="public/images/logo.png" alt="VioLink Studio Logo" width="80" height="80" />
  <h1>VioLink Studio</h1>
  <p><strong>Platform Bio Link Terestetik, Modern, & High-Performance untuk Kreator Digital</strong></p>

  <p>
    <a href="https://violink.space"><strong>violink.space »</strong></a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Prisma-ORM-5A67D8?style=for-the-badge&logo=prisma" alt="Prisma" />
    <img src="https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?style=for-the-badge&logo=postgresql" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/Cloudinary-Media-3448C5?style=for-the-badge&logo=cloudinary" alt="Cloudinary" />
    <img src="https://img.shields.io/badge/Framer_Motion-11-purple?style=for-the-badge&logo=framer" alt="Framer Motion" />
    <img src="https://img.shields.io/badge/Vercel-Deploys-000000?style=for-the-badge&logo=vercel" alt="Vercel" />
  </p>
</div>

---

## 🌟 Tentang VioLink Studio

**VioLink Studio** (`violink.space`) adalah platform bio link modern berteknologi tinggi yang dirancang khusus untuk kreator konten, profesional, dan pemilik bisnis. Dibangun dengan fokus utama pada kebebasan estetika visual, animasi halus berakselerasi hardware, serta kecepatan muat dalam hitungan milidetik.

---

## ✨ Fitur Utama

- 🎨 **Kebebasan Background Tanpa Batas**:
  - Warna Solid & Gradasi Bergerak (*Animated Gradient*).
  - Unggah Foto Background Kustom milik sendiri via **Cloudinary CDN**.
  - Efek Blur Frosted Glass (*Backdrop Filter*) & Pengontrol Overlay Brightness.
  - Pola Tekstur Eksklusif (*Dots, Grid, Noise*).

- ✦ **Kustomisasi Gaya & Bentuk Tombol**:
  - Tipe Tombol: **Frosted Glass**, **Solid Fill**, dan **Outline**.
  - Bebas atur lekukan sudut tombol: **Pill (Kapsul)**, **Rounded (Membulat)**, hingga **Square (Kotak)**.
  - Kustomisasi warna teks dan warna latar tombol secara bebas.

- 📈 **Analitik Real-Time**:
  - Laporan grafik kunjungan harian (*Page Views*) dan klik link (*Link Clicks*).
  - Lacak performa link paling populer secara instan di Creator Dashboard.

- 📱 **Mobile-First & Ultra-Responsif**:
  - Antarmuka dirancang khusus agar sempurna di layar iPhone, Android, maupun Desktop.
  - Jarak clearance header dan elemen kustom teroptimasi tanpa teks terpotong (*no overflow*).

- 🔒 **Autentikasi Terpadu Tanpa Reload**:
  - Glassmorphism Auth Modal Popup langsung di homepage (`/?auth=login` / `/?auth=register`).
  - Pengalaman *Sign In & Sign Out* yang mulus dan instan.

---

## 🛠️ Teknologi & Arsitektur

VioLink Studio dibangun menggunakan teknologi *full-stack* modern:

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Bahasa**: [TypeScript](https://www.typescriptlang.org/)
- **Database & ORM**: [PostgreSQL (Supabase)](https://supabase.com/) & [Prisma ORM](https://www.prisma.io/)
- **Media Storage (Upload)**: [Cloudinary](https://cloudinary.com/)
- **Animasi**: [Framer Motion](https://www.framer.com/motion/)
- **Styling**: Vanilla CSS Modules (Arsitektur CSS murni tanpa overhead utility)
- **Deployment**: [Vercel](https://vercel.com/)

---

## 🚀 Panduan Memulai (Local Development)

### 1. Prasyarat
- Node.js versi 18.x atau lebih baru
- NPM / Yarn / PNPM

### 2. Kloning Repository
```bash
git clone https://github.com/aafifr/violink.space.git
cd violink.space
```

### 3. Instalasi Dependensi
```bash
npm install
```

### 4. Konfigurasi Environment Variables (`.env`)
Buat file `.env` di root direktori project dan masukkan variabel berikut:
```env
# Database (Supabase PostgreSQL)
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres"

# Authentication
JWT_SECRET="your_custom_jwt_secret_key_here"

# Media Storage (Cloudinary)
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
```

### 5. Push Schema Database (Prisma)
```bash
npx prisma db push
```

### 6. Jalankan Server Dev
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) di browser kamu.

---

## 📦 Deployment Ke Produksi

### Deploy ke Vercel (Gratis 100%):
1. Push repository ini ke GitHub kamu (`github.com/aafifr/violink.space`).
2. Buka [Vercel Dashboard](https://vercel.com/) dan import repository `violink.space`.
3. Masukkan 6 variabel di atas (`DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, `CLOUDINARY_*`) pada **Environment Variables**.
4. Klik **Deploy**.
5. Tambahkan custom domain `violink.space` di menu **Settings ➔ Domains** Vercel.

---

## 📝 Lisensi & Kreator

Dikembangkan dengan penuh dedikasi oleh **[Afif](https://github.com/aafifr)**.

© 2026 **VioLink Studio**. Hak cipta dilindungi undang-undang.

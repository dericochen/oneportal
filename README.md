# ONE PORTAL

Satu pintu layanan publik Kota Medan: informasi layanan dan pengaduan dalam satu alur tertutup.

**Lapor → Diverifikasi → Ditugaskan → Dikerjakan → Peninjauan bukti → Selesai.** Laporan hanya selesai setelah admin menyetujui foto sebelum–sesudah dari petugas, lalu buktinya terbuka untuk publik di peta.

> Prototipe untuk Lomba Web Development IT Fest UMK 2026, bukan kanal resmi Pemerintah Kota Medan. Keadaan darurat: hubungi 112.

Status: **Fase 0 (fondasi)**. Fitur Lapor, Lacak, Layanan, dan Peta menyusul per fase dan disembunyikan sampai selesai.

## Akun demo

Kata sandi semua akun: `MedanTuntas2026`. Di halaman `/masuk` tersedia tombol masuk cepat.

| Peran | Email | Halaman |
|---|---|---|
| Warga | demo.warga@oneportal.test | `/akun` |
| Admin | demo.admin@oneportal.test | `/admin` |
| Petugas lapangan (Dinas SDABMBK) | demo.petugas@oneportal.test | `/petugas` |
| Supervisor | demo.supervisor@oneportal.test | `/supervisor` |

Akun demo dilindungi database: tidak bisa dihapus, dinonaktifkan, atau diubah perannya.

## Teknologi

Next.js 16 (App Router, TypeScript strict) · Tailwind CSS 4 dengan token sendiri · Radix (primitif) · Phosphor Icons · Zod · Supabase (Postgres + PostGIS, Auth, Storage, RLS) · Vercel.

Tanpa template admin/landing. Sistem desain "rambu kota" ada di [DESIGN.md](DESIGN.md) dan halaman `/desain`.

## Menjalankan secara lokal

Butuh Node.js 24 dan satu proyek Supabase (paket Free cukup).

1. **Siapkan Supabase**
   - Buat proyek baru (region Singapore paling dekat ke Medan).
   - Authentication > Sign In / Providers > Email: **matikan "Confirm email"**. Pengirim email bawaan Supabase dibatasi 2 email/jam dan hanya ke anggota tim, jadi juri tidak akan bisa mendaftar bila ini menyala.
   - PostGIS diaktifkan otomatis oleh migrasi.
2. **Isi variabel lingkungan**
   ```bash
   cp .env.example .env.local
   ```
   Isi semua nilai. `SUPABASE_SERVICE_ROLE_KEY` dan `CRON_SECRET` adalah rahasia: jangan dibagikan, jangan diberi awalan `NEXT_PUBLIC_`. `SUPABASE_DB_URL` opsional: bila kosong, skrip `db:*` memakai Supabase CLI (`npx supabase login` lalu `npx supabase link --project-ref <ref>`).
3. **Pasang dependensi, migrasi, dan seed**
   ```bash
   npm ci
   npm run db:migrasi   # terapkan supabase/migrations ke database
   npm run db:seed      # data master + 4 akun demo (idempoten)
   npm run dev
   ```
   Buka http://localhost:3000.

## Perintah

| Perintah | Fungsi |
|---|---|
| `npm run dev` / `build` / `start` | Pengembangan, build produksi, server produksi |
| `npm run lint` · `npm run typecheck` | ESLint · TypeScript |
| `npm run audit:desain` | Pindai pola "rasa AI" dan warna di luar token (DESIGN.md §11) |
| `npm run db:uji` | Uji migrasi, fungsi transisi, dan RLS di Postgres lokal (PGlite), tanpa Supabase/Docker |
| `npm run periksa` | Semua pemeriksaan di atas |
| `npm run db:migrasi` | Terapkan migrasi baru ke Supabase |
| `npm run db:seed` | Seed data master dan akun demo |
| `npm run db:reset-demo -- --ya` | Hapus semua laporan, riwayat, notifikasi, dan foto, lalu seed ulang. Tidak dapat dibatalkan |

## Deploy (Vercel)

1. Impor repositori di Vercel. Isi Environment Variables sesuai `.env.example` kecuali `SUPABASE_DB_URL` (hanya untuk skrip lokal). `NEXT_PUBLIC_SITE_URL` = URL Vercel.
2. Di GitHub, Settings > Secrets and variables > Actions, tambahkan `SITE_URL` dan `CRON_SECRET` (sama dengan di Vercel). Workflow `tick.yml` memanggil `/api/cron/tick` setiap jam untuk eskalasi SLA dan menjaga proyek Supabase Free tidak dijeda.

## Arsitektur keamanan

Akses ditegakkan di tiga lapis:

1. **Route guard** (`src/proxy.ts`): halaman akun, admin, petugas, dan supervisor butuh masuk.
2. **Pengecekan peran** di layout tiap area dan di setiap Server Action (`wajibPeran`). Peran salah → 403.
3. **Row Level Security** di semua tabel. Data milik orang lain tidak terbaca → 404 (keberadaannya tidak bocor).

Aturan lain:
- **Satu pintu perubahan status**: `public.transition_report()` memvalidasi peran, status asal, dan data wajib dalam satu transaksi, lalu menulis riwayat dan notifikasi. Trigger menolak penulisan langsung ke tabel `reports`, termasuk dari service role.
- **Riwayat tidak bisa diubah atau dihapus** (audit trail). Perubahan data master tercatat di `audit_logs` beserta pelaku dan nilai sebelum–sesudah.
- Pendaftaran selalu membuat akun **warga**; metadata peran dari klien diabaikan. Pengguna hanya bisa mengubah nama dan nomor HP sendiri.
- Service role key hanya di server (`server-only`). Endpoint cron memakai rahasia ≥32 karakter dengan perbandingan waktu-konstan.
- Privasi (prinsip UU PDP No. 27/2022): tanpa NIK, opsi anonim dan rahasia, identitas pelapor tidak pernah tampil publik.

## Struktur

```
src/
  app/(publik)/   beranda, masuk, daftar, akun, notifikasi, desain
  app/admin/      area admin          app/supervisor/  area supervisor
  app/petugas/    area petugas        app/api/cron/    pengecekan SLA
  aksi/           Server Actions
  components/ui/  komponen dasar sistem desain
  components/tata-letak/  header, footer, navigasi, kerangka per peran
  lib/            auth, format WIB, domain laporan, klien Supabase
supabase/migrations/  skema, trigger, fungsi transisi, RLS & Storage
scripts/          migrasi, seed, reset demo, uji database, audit desain
data/             wilayah Kemendagri & batas OpenStreetMap
```

## Data yang perlu dicek tim

- **Instansi** di `scripts/lib/master.mts` adalah simulasi. Cocokkan nama dan tugas dengan SOTK terbaru Pemko Medan, terutama kewenangan lampu jalan.
- **Kontak instansi eksternal** (Perumda Tirtanadi, PLN, balai jalan nasional) sengaja dikosongkan sampai diverifikasi.
- **Nama kelurahan** ditulis persis seperti sumber Kemendagri, termasuk singkatan (mis. "Tegal S Mandala II").

Sumber data dan lisensi: [CREDITS.md](CREDITS.md).

# Gee Co. — Situs Publik + Admin

Web app Gee Co.: **situs publik** (profil, kolaborasi, kontak, blog) dan **area admin** di balik
`/login` (invoice, klien, produk, CMS blog, pengguna). Dibangun dengan **Next.js 16 (App Router) +
TypeScript + Tailwind CSS v4**, di-*export* statis (`output: 'export'`), dengan backend **Supabase**
(Postgres + Auth + Storage) dan otorisasi lewat **Row Level Security (RLS)**.

## Fitur

- **Situs publik** — `/`, `/collaboration`, `/contact`, `/blog` + `/blog/[slug]` (prerender saat build/SSG).
- **Auth & peran** — `/login` (khusus *masuk*; akun dibuat oleh superuser). Tiga peran:
  `superuser`, `staff_finance`, `editor`.
- **Invoice** — buat/edit, multi-item, diskon, ongkos kirim, pajak opsional, DP/uang muka,
  status (Draft/Terkirim/Lunas/Batal), nomor otomatis atomik via RPC.
- **Master klien & produk**, **Pengaturan** perusahaan (logo, rekening, default pajak).
- **Harga khusus per klien** — tiap klien (cafe) punya daftar harga sendiri, lengkap dengan
  **tanggal berlaku** untuk menyiapkan kenaikan harga. Invoice mengisi harga otomatis sesuai klien
  & tanggal; invoice lama tidak ikut berubah.
- **CMS blog** — editor Markdown + preview, upload sampul ke Storage, publish memicu rebuild situs.
- **Manajemen pengguna** — superuser **menambah / mengubah / menghapus** akun dan mengatur perannya
  di `/admin/users` (pembuatan & penghapusan lewat Edge Function `admin-users`).

## Peran & akses

| Menu | superuser | staff_finance | editor |
| --- | :---: | :---: | :---: |
| Dashboard | ✅ | – | – |
| Invoice | ✅ | ✅ | – |
| Klien | ✅ | ✅ | – |
| Produk | ✅ | ✅ | – |
| Blog | ✅ | – | ✅ |
| Pengguna | ✅ | – | – |
| Pengaturan | ✅ | – | – |

Menu difilter per peran dan konten di-gate di `AppShell` (`src/lib/access.ts`); rute di luar akses
dialihkan ke halaman utama peran. Batas keamanan sebenarnya tetap **RLS** di database.

## Menjalankan

```bash
npm install
cp .env.example .env.local   # isi kredensial Supabase
npm run dev                  # http://localhost:3000
```

## Setup Supabase (sekali)

1. **Migrasi** — jalankan berurutan di SQL Editor: `supabase/migrations/0001_init.sql`,
   `0002_profiles_email.sql`, `0003_client_prices.sql`, `0004_security_hardening.sql`
   (semuanya idempoten, aman diulang).
2. **Edge Function** (untuk membuat/menghapus akun):

   ```bash
   supabase login
   supabase link --project-ref <project-ref>
   supabase functions deploy admin-users
   ```

   Fungsi memakai `service_role` yang tersedia otomatis di runtime; klien tetap hanya memakai
   publishable key.
3. **(Disarankan)** Nonaktifkan pendaftaran publik: Authentication → Sign In / Up → matikan
   *Allow new users to sign up*. Admin API `createUser` tetap berfungsi.

## Skrip

| Perintah | Fungsi |
| --- | --- |
| `npm run dev` | Jalankan dev server |
| `npm run build` | Build static export ke `out/` |
| `npm run lint` | ESLint |
| `npm test` | Test (Vitest) |
| `npx tsc --noEmit` | Typecheck |

## Pengujian

Test berada di `src/**/*.test.ts` dan menargetkan fungsi murni (mis. `src/lib/calc.test.ts`,
`src/lib/format.test.ts`). Jalankan dengan `npm test`.

## CI & Deploy

- `.github/workflows/ci.yml` — `lint` + `tsc` + `test` + `build` pada setiap push/PR, plus
  `deno test` untuk Edge Function (job `edge-functions`).
- `.github/workflows/deploy.yml` — deploy ke **Cloudflare Pages** (butuh secrets
  `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, + variable `CLOUDFLARE_PROJECT_NAME`;
  langkah deploy dilewati otomatis bila belum diset). Alternatif: integrasi Git Cloudflare Pages
  (build command `npm run build`, output directory `out`).
- `.github/workflows/backup.yml` — `pg_dump` harian sebagai artifact (butuh secret `SUPABASE_DB_URL`).
- **Deploy hook blog** diatur di dalam aplikasi: `/admin/settings` → **Situs Publik** (disimpan di
  database, tidak ikut ke bundle publik).
- **Logo** dipakai di header publik, `/login`, sidebar admin, invoice, dan favicon/ikon tab.
  Default dari `public/img/logo-320.png` (sumber 1254px disimpan di `assets/brand/` agar tidak
  ikut di-deploy); unggahan di `/admin/settings` menimpanya (disimpan di Storage).

## Data & keamanan

- Data tersimpan di **Supabase** dan dilindungi **RLS** — UI hanya kosmetik, batas keamanan sebenarnya
  ada di database. Publishable (anon) key aman ada di bundle; **jangan pernah** menaruh
  `service_role`/secret key di klien.
- Sesi Supabase disimpan di `localStorage` (konsekuensi situs statis); bukan cookie httpOnly.
- Env di `.env.local` (gitignored). Contoh di `.env.example`.
- Supabase Free bisa *pause* bila idle ~1 minggu; trafik situs publik menjaga tetap hidup.

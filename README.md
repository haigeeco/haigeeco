# Gee Co. — Situs Publik + Admin

Web app Gee Co.: **situs publik** (profil, kolaborasi, kontak, blog) dan **area admin** di balik
`/login` (invoice, klien, produk, CMS blog, pengguna). Dibangun dengan **Next.js 16 (App Router) +
TypeScript + Tailwind CSS v4**, di-*export* statis (`output: 'export'`), dengan backend **Supabase**
(Postgres + Auth + Storage) dan otorisasi lewat **Row Level Security (RLS)**.

## Fitur

- **Situs publik** — `/`, `/collaboration`, `/contact`, `/blog` + `/blog/[slug]` (prerender saat build/SSG).
- **Auth & peran** — `/login` (khusus *masuk*; akun dibuat oleh superuser) dengan
  email **atau username**. Tiga peran: `superuser`, `staff_finance`, `editor`.
- **Invoice** — buat/edit, multi-item, diskon, ongkos kirim, pajak opsional, DP/uang muka,
  status (Draft/Terkirim/Lunas/Batal), nomor otomatis atomik via RPC.
- **Master klien & produk**, **Pengaturan** perusahaan (logo, rekening, default pajak).
- **Produk tampil di situs publik** langsung dari menu Produk admin, lengkap dengan foto,
  kategori, deskripsi, urutan tampil, dan **harga customer**. Harga **B2B/kolaborasi**
  disimpan terpisah (`products.price`) dan tidak pernah dikirim ke situs publik.
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
   `0002_profiles_email.sql`, `0003_client_prices.sql`, `0004_security_hardening.sql`,
   `0005_settings_read.sql`, `0006_site_config.sql`, `0007_products_public.sql`,
   `0008_usernames.sql` (semuanya idempoten, aman diulang).
2. **Edge Function** — `admin-users` (membuat/menghapus akun), `login` (masuk dengan
   email atau username), dan `rebuild-site` (memicu rebuild blog):

   ```bash
   supabase login
   supabase link --project-ref <project-ref>
   supabase functions deploy admin-users
   supabase functions deploy login
   supabase functions deploy rebuild-site
   ```

   `login` memakai `verify_jwt = false` karena dipanggil sebelum ada sesi. Fungsi ini
   mengubah username menjadi email di server, jadi email tidak pernah bocor ke klien.

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
- **Deploy** ditangani langsung oleh **Cloudflare Pages Git integration** (proyek `geeco` →
  https://geeco.pages.dev): setiap push ke `main`, Cloudflare menjalankan `npm run build`
  (output `out`) dengan env `NEXT_PUBLIC_SUPABASE_*` dari dashboard Pages. Tidak perlu workflow
  deploy atau API token Cloudflare.
- `.github/workflows/backup.yml` — `pg_dump` harian sebagai artifact (butuh secret `SUPABASE_DB_URL`).
- **Deploy hook blog** diatur di dalam aplikasi: `/admin/settings` → **Situs Publik**. Ambil URL
  dari Cloudflare Pages → proyek `geeco` → **Settings → Builds & deployments → Deploy hooks**.
  URL disimpan di tabel `site_config` (hanya superuser dapat membacanya, tidak ikut ke bundle
  publik); saat artikel pertama kali diterbitkan, klien memanggil Edge Function `rebuild-site`
  yang memicu hook.
- **Logo** dipakai di header publik, `/login`, sidebar admin, invoice, dan favicon/ikon tab.
  Default dari `public/img/logo-320.png` (sumber 1254px disimpan di `assets/brand/` agar tidak
  ikut di-deploy); unggahan di `/admin/settings` menimpanya (disimpan di Storage).

## SEO / AEO / GEO

Situs publik dioptimalkan untuk pencarian lokal di Sukoharjo & Surakarta dan untuk dikutip
mesin jawaban (AI Overviews, ChatGPT, Perplexity):

- **Landing page bertarget intent** — `/products` (Dubai Chewy, dessert, jajanan viral) dan
  `/collaboration` (supplier dessert untuk cafe, restoran, toko kue; menggabungkan halaman
  supplier sebelumnya).
- **Dua bahasa (ID | EN)** lewat tombol di header. Konten inti diterjemahkan di komponen
  `src/components/marketing/*`; preferensi bahasa disimpan di `localStorage`.
- **Structured data JSON-LD** di `src/lib/seo.ts`: `Organization`, `WebSite`, `Bakery`
  (`LocalBusiness`), `Service`, `FAQPage`, `Product`/`ItemList`, `BlogPosting`,
  `BreadcrumbList`, dan `HowTo`.
- **Metadata** per halaman (canonical, Open Graph, Twitter Card, keywords) + `metadataBase`.
- **`app/robots.ts`** mengizinkan crawler mesin pencari dan bot AI (GPTBot, PerplexityBot,
  ClaudeBot, Google-Extended, dll.) serta memblokir `/admin/` dan `/login`.
- **`app/sitemap.ts`** menghasilkan `sitemap.xml` (halaman statis + artikel blog terbit).
- **`public/llms.txt`** merangkum bisnis, produk, area layanan, dan FAQ untuk agen AI.
- **Konten** produk publik dibaca dari tabel `products` (`website_visible = true`,
  `active = true`) melalui kolom aman saja. `src/lib/seo-content.ts` tetap menjadi fallback
  statis bila DB belum siap. Harga B2B (`price`) tidak pernah ikut dibaca.

Variabel lingkungan terkait (lihat `.env.example`): `NEXT_PUBLIC_SITE_URL`,
`NEXT_PUBLIC_WHATSAPP`, `NEXT_PUBLIC_CONTACT_EMAIL`, `NEXT_PUBLIC_BUSINESS_ADDRESS`,
`NEXT_PUBLIC_INSTAGRAM_URL`, `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`.

**Langkah manual (butuh akun):** daftarkan bisnis di **Google Business Profile** (kategori
Bakery/Dessert shop, kota Sukoharjo, jam buka, foto produk) dan verifikasi situs di
**Google Search Console**, lalu kirim `sitemap.xml`. Untuk hasil terbaik, pastikan NAP
(nama, alamat, telepon) di situs sama dengan profil Google Business.

## Data & keamanan

- Data tersimpan di **Supabase** dan dilindungi **RLS** — UI hanya kosmetik, batas keamanan sebenarnya
  ada di database. Publishable (anon) key aman ada di bundle; **jangan pernah** menaruh
  `service_role`/secret key di klien.
- Sesi Supabase disimpan di `localStorage` (konsekuensi situs statis); bukan cookie httpOnly.
- Env di `.env.local` (gitignored). Contoh di `.env.example`.
- Supabase Free bisa *pause* bila idle ~1 minggu; trafik situs publik menjaga tetap hidup.

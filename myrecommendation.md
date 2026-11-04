# Rekomendasi Pengembangan — Gee Co. Invoice Manager

Dokumen ini berisi daftar peningkatan untuk aplikasi invoice Gee Co., disusun dari hasil
review kode setelah versi pertama selesai. Urutannya berdasarkan **risiko**, bukan kerumitan.
Centang `[x]` setiap item yang sudah selesai.

**Stack saat ini:** Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · static export
(`output: 'export'`) · data di `localStorage` · deploy GitHub Pages.

## Legenda Prioritas

| Prioritas | Arti |
| --- | --- |
| **P0** | Kritis — berisiko kehilangan/merusak data atau angka salah. Kerjakan dulu. |
| **P1** | Penting — kualitas, keandalan, dan mencegah bug di produksi. |
| **P2** | Peningkatan — UX, performa, kualitas output. |
| **P3** | Nice-to-have — fitur bisnis lanjutan & operasional. |

## Ringkasan

| # | Prioritas | Item | Area |
| --- | --- | --- | --- |
| P0-1 | Kritis | Penyimpanan gagal tapi senyap | Data |
| P0-2 | Kritis | Multi-tab tidak sinkron (data hilang) | Data |
| P0-3 | Kritis | Pembulatan pajak tidak konsisten | Angka |
| P0-4 | Kritis | Diskon bisa melebihi subtotal (total negatif) | Angka |
| P0-5 | Kritis | Import JSON tanpa validasi skema | Data |
| P1-1 | Penting | Belum ada test otomatis | Kualitas |
| P1-2 | Penting | CI tidak menjalankan lint/test | Kualitas |
| P1-3 | Penting | Belum ada error boundary | Kualitas |
| P1-4 | Penting | Hapus invoice membuat gap nomor | Data |
| P1-5 | Penting | Backup hanya manual | Data |
| P2-1 | Peningkatan | Page-break cetak belum diatur | PDF |
| P2-2 | Peningkatan | Input uang tanpa pemisah ribuan | UX |
| P2-3 | Peningkatan | Modal tanpa focus trap / a11y | UX |
| P2-4 | Peningkatan | Performa tulis/baca & virtualisasi list | Performa |
| P2-5 | Peningkatan | PDF deterministik (bukan print browser) | PDF |
| P3-* | Nice-to-have | Riwayat pembayaran, aging, CSV, reminder, PWA, dll. | Fitur |

---

## P0 — Kritis

- [ ] **P0-1 · Tangani kegagalan penyimpanan (silent save failure)**
  - **Masalah:** `commit()` membungkus `localStorage.setItem` dengan `catch {}`. Jika kuota penuh
    (localStorage ±5 MB, cepat tercapai karena logo base64 + many invoices) atau storage diblokir,
    penulisan gagal **tanpa pesan**. UI terlihat sukses, tapi data hilang setelah refresh.
  - **Dampak:** Kehilangan invoice secara diam-diam. Paling berbahaya karena tidak terlihat.
  - **Perbaikan:**
    - Ubah `commit()` agar mengembalikan status sukses/gagal; jangan telan error.
    - Tampilkan notifikasi/toast "Gagal menyimpan — penyimpanan browser penuh" bila gagal.
    - Batasi ukuran logo (kompres/resize sebelum disimpan sebagai data URL).
    - Pertimbangkan pindah ke **IndexedDB** untuk kapasitas jauh lebih besar.
  - **File:** `src/lib/storage.ts`, `src/app/settings/page.tsx` (upload logo).

- [ ] **P0-2 · Sinkronisasi antar-tab**
  - **Masalah:** Tiap tab punya `cache` di memori sendiri; tidak ada listener event `storage`.
    Menyimpan di tab A lalu tab B (yang datanya lebih lama) menimpa → perubahan tab A hilang.
  - **Dampak:** Data hilang saat membuka beberapa tab (mis. buka invoice di tab baru).
  - **Perbaikan:** Dengarkan event `storage` dan segarkan cache:
    ```ts
    if (typeof window !== "undefined") {
      window.addEventListener("storage", (e) => {
        if (e.key !== STORAGE_KEY) return;
        cache = e.newValue ? hydrate(JSON.parse(e.newValue)) : emptyDatabase();
        listeners.forEach((l) => l());
      });
    }
    ```
    Tambahan: cegah race nomor invoice (P1-4) dengan cek ulang sebelum commit.
  - **File:** `src/lib/storage.ts`.

- [ ] **P0-3 · Pembulatan pajak yang konsisten**
  - **Masalah:** `computeTotals()` menyimpan `taxAmount` sebagai float dan pembulatan hanya
    dilakukan saat menampilkan (`formatIDR`). Akibatnya subtotal + pajak bisa ≠ total setelah
    dibulatkan (selisih 1 rupiah).
  - **Dampak:** Angka invoice tidak balance — masalah serius untuk pembukuan/pajak.
  - **Perbaikan:** Bulatkan di titik perhitungan, bukan hanya saat render:
    ```ts
    const rupiah = (n: number) => Math.round(n);
    const netBeforeTax = rupiah(subtotal - discount + shipping);
    const taxAmount = taxEnabled ? rupiah(netBeforeTax * (taxRate / 100)) : 0;
    const total = netBeforeTax + taxAmount;
    ```
    Terapkan pembulatan yang sama di form, dokumen, dan ringkasan dashboard.
  - **File:** `src/lib/calc.ts`, `src/components/InvoiceForm.tsx`, `src/components/InvoiceDocument.tsx`.

- [ ] **P0-4 · Validasi diskon, ongkir, DP, dan kuantitas**
  - **Masalah:** Nilai bisa negatif atau melebihi subtotal (input `type="number"` masih bisa
    diketik negatif). Diskon > subtotal menghasilkan total negatif.
  - **Dampak:** Invoice dengan angka mustahil terkirim ke klien.
  - **Perbaikan:** Validasi saat submit + clamp: `discount` ≤ subtotal, `downPayment` ≤ total,
    `quantity`/`unitPrice` ≥ 0, `discountPercent` 0–100. Tampilkan pesan error per field.
  - **File:** `src/components/InvoiceForm.tsx`, `src/lib/calc.ts`.

- [ ] **P0-5 · Validasi skema saat impor JSON**
  - **Masalah:** `importDatabase()` menerima struktur apa pun; `hydrate()` hanya memaksa level
    teratas. Jika `invoices[0].items` bukan array, `computeTotals()` akan error → app crash.
  - **Dampak:** File backup rusak / dari versi lain bisa melumpuhkan aplikasi.
  - **Perbaikan:** Validasi dengan **zod** (atau validator manual) sebelum commit; tolak dengan
    pesan yang jelas bila tidak cocok. Tambahkan proses **migrasi versi** (`Database.version`)
    agar file lama tetap bisa dibuka.
  - **File:** `src/lib/storage.ts`, `src/lib/types.ts`.

---

## P1 — Penting

- [ ] **P1-1 · Tambahkan test otomatis**
  - **Masalah:** Belum ada test sama sekali. Padahal `calc`, `format`, dan `storage` adalah fungsi
    murni yang mudah diuji.
  - **Perbaikan:** Tambah **Vitest** + `@testing-library/react`. Uji minimal:
    - `computeTotals` — subtotal, diskon item & invoice, ongkir, pajak on/off, DP, pembulatan.
    - `buildInvoiceNumber` / `createInvoice` — urutan nomor, tanpa gap, reset per tahun.
    - `parseNumber` / `formatIDR` — parsing "1.234.567", "1234567,5", dll.
    - `snapshotClient` — invoice tetap valid walau klien dihapus.
  - **File baru:** `src/lib/calc.test.ts`, `src/lib/format.test.ts`, `src/lib/storage.test.ts`, `vitest.config.ts`.

- [ ] **P1-2 · CI menjalankan lint & test**
  - **Masalah:** `.github/workflows/deploy.yml` hanya `npm ci` + build + deploy. Typo/regresi bisa
    lolos ke produksi.
  - **Perbaikan:** Jalankan `npm run lint`, `npx tsc --noEmit`, dan `npm test` sebagai langkah
    sebelum build/deploy (gagalkan pipeline bila ada yang merah).
  - **File:** `.github/workflows/deploy.yml`, `package.json`.

- [ ] **P1-3 · Error boundary**
  - **Masalah:** Belum ada `error.tsx`/`global-error.tsx`. Satu error runtime = layar putih.
  - **Perbaikan:** Tambah `src/app/error.tsx` (dan `global-error.tsx`) dengan UI ramah +
    tombol "Muat ulang" dan opsi "Unduh data terakhir sebelum error" agar tidak kehilangan data.
  - **File baru:** `src/app/error.tsx`, `src/app/global-error.tsx`.

- [ ] **P1-4 · Cegah gap & duplikasi nomor invoice**
  - **Masalah:** `deleteInvoice` menghapus permanen → nomor bolong (jelek untuk audit). Dan dua tab
    bisa menghasilkan nomor sama (lihat P0-2).
  - **Perbaikan:**
    - Ganti hapus permanen dengan **soft delete** (status `cancelled`) sebagai default; sediakan
      hapus permanen hanya untuk draft.
    - Pastikan nomor tetap unik lintas-tab: cek ulang `used` tepat sebelum commit.
    - Sediakan opsi **override nomor manual** di form (untuk migrasi dari sistem lama).
  - **File:** `src/lib/storage.ts`, `src/app/invoices/view/page.tsx`, `src/components/InvoiceForm.tsx`.

- [ ] **P1-5 · Backup otomatis & pengingat**
  - **Masalah:** Backup sepenuhnya manual; pengguna bisa lupa.
  - **Perbaikan:** Simpan snapshot otomatis (mis. harian) di storage terpisah, tampilkan tanggal
    backup terakhir di Dashboard, dan ingatkan bila > 7 hari belum backup.
  - **File:** `src/lib/storage.ts`, `src/app/page.tsx`, `src/app/settings/page.tsx`.

---

## P2 — Peningkatan

- [ ] **P2-1 · Aturan page-break untuk cetak**
  - **Masalah:** Invoice banyak item bisa memotong blok total/tabel di tengah halaman.
  - **Perbaikan:** Tambah di `globals.css`:
    ```css
    @media print {
      table { page-break-inside: auto; }
      tr, thead { break-inside: avoid; }
      .totals-block, .doc-header { break-inside: avoid; }
      .page-break { break-before: page; }
    }
    ```
  - **File:** `src/app/globals.css`, `src/components/InvoiceDocument.tsx`.

- [ ] **P2-2 · Masking mata uang pada input**
  - **Masalah:** Input angka polos — rawan salah ketik (1.850.000 vs 18.500.000).
  - **Perbaikan:** Buat komponen `CurrencyInput` yang memformat ribuan saat mengetik dan
    menyimpan nilai numerik. Pakai di harga satuan, diskon, ongkir, DP.
  - **File baru:** `src/components/CurrencyInput.tsx`; update `InvoiceForm.tsx`.

- [ ] **P2-3 · Aksesibilitas modal & form**
  - **Masalah:** Modal tanpa `role="dialog"`, `aria-modal`, focus trap, atau fokus awal. Pesan error
    tidak terhubung ke field (`aria-describedby`).
  - **Perbaikan:** Tambah atribut ARIA, pindahkan fokus ke modal saat dibuka, kunci Tab di dalam
    modal, kembalikan fokus saat ditutup. Ganti `window.confirm()` dengan dialog konfirmasi sendiri.
  - **File:** `src/components/ui.tsx`, halaman klien/produk/invoice.

- [ ] **P2-4 · Performa**
  - **Masalah:** Setiap mutasi men-serialisasi **seluruh** DB ke JSON; render list tanpa
    virtualisasi. Mulai berat di ribuan invoice.
  - **Perbaikan:**
    - Tulis hanya bagian yang berubah (atau pindah ke IndexedDB dengan tabel terpisah).
    - Pisahkan `storage.ts` (state + CRUD + hooks) menjadi modul yang lebih kecil.
    - Virtualisasi daftar invoice (`@tanstack/react-virtual`) bila data besar.
  - **File:** `src/lib/storage.ts`, `src/app/invoices/page.tsx`.

- [ ] **P2-5 · PDF deterministik**
  - **Masalah:** "Unduh PDF" memakai `window.print()` — hasil bergantung setelan browser
    (margin, scale, header/footer). Tidak bisa dilampirkan langsung ke WhatsApp.
  - **Perbaikan:** Generate PDF asli (mis. `@react-pdf/renderer` atau `pdfmake`) dengan layout
    terukur, sediakan tombol unduh `.pdf`, dan simpan blob agar bisa dibagikan via Web Share API
    (`navigator.share`) di perangkat yang mendukung.
  - **File:** `src/app/invoices/print/page.tsx`, komponen dokumen baru.

---

## P3 — Fitur & operasional (nice-to-have)

- [ ] **P3-1 · Riwayat pembayaran (cicilan).** Dukung multi-pembayaran dengan tanggal & metode,
      bukan hanya satu field DP + status Lunas. Otomatis hitung sisa tagihan.
- [ ] **P3-2 · Aging report & statement klien.** Rekap umur piutang (0–30/31–60/61–90 hari) dan
      rekapitulasi tagihan per klien untuk mempermudah penagihan.
- [ ] **P3-3 · Ekspor CSV/Excel** untuk pembukuan/akuntan.
- [ ] **P3-4 · Reminder jatuh tempo otomatis** — daftar invoice overdue + tombol kirim template
      WhatsApp massal.
- [ ] **P3-5 · Surat jalan / delivery note** + referensi PO pada invoice.
- [ ] **P3-6 · Penanda visual "LUNAS"** (watermark/stempel) dan ruang tanda tangan pada dokumen.
- [ ] **P3-7 · PWA / offline.** Sangat cocok dengan arsitektur static + localStorage: bisa
      di-install di HP dan dibuka tanpa internet.
- [ ] **P3-8 · Multi-currency** bila mulai melayani klien luar negeri.
- [ ] **P3-9 · Backend + auth (opsional).** Hanya jika butuh sinkronisasi multi-device; ini
      memerlukan server/database (mis. Supabase) dan sistem login.
- [ ] **P3-10 · Housekeeping.** Hapus aset tak terpakai di `public/` (`next.svg`, `vercel.svg`,
      `file.svg`, `globe.svg`, `window.svg`); jalankan `npm audit` & update dependensi;
      pertimbangkan self-host font agar build tidak bergantung jaringan ke Google Fonts.

---

## Urutan pengerjaan yang disarankan

1. **P0-1 → P0-2 → P0-3 → P0-4 → P0-5** (data & angka benar dulu — ini fondasi).
2. **P1-1 → P1-2 → P1-3** (test + CI + error boundary: jaring pengaman untuk perubahan berikutnya).
3. **P1-4 → P1-5** (integritas nomor & backup otomatis).
4. **P2-1 → P2-2 → P2-3 → P2-5 → P2-4** (output & UX).
5. **P3-\*** sesuai kebutuhan bisnis.

## Cara memverifikasi perbaikan

- **P0-1:** Isi storage sampai penuh (atau matikan localStorage), lalu simpan invoice → harus muncul
  pesan gagal, bukan sukses palsu.
- **P0-2:** Buka dua tab, tambah klien di tab A, lihat tab B ikut ter-update tanpa refresh.
- **P0-3:** Buat invoice dengan tarif pajak non-bulat (mis. 11%) → pastikan subtotal + pajak = total.
- **P0-4:** Coba isi diskon lebih besar dari subtotal → ditolak dengan pesan jelas.
- **P0-5:** Impor file JSON yang sengaja dirusak → ditolak, aplikasi tetap berjalan.
- **P1-1/P1-2:** `npm test` hijau; PR dengan error lint/tsc gagal di CI.
- **P1-3:** Lempar error buatan di sebuah komponen → muncul halaman error, bukan layar putih.
- **P2-1:** Cetak invoice dengan 30+ item → blok total tidak terpotong antar halaman.

## Catatan operasional

- Data **hanya** di `localStorage` browser: satu perangkat = satu dataset. Selalu unduh backup rutin.
- Repo belum di-`git init`. Jalankan `git init` lalu commit pertama sebelum push ke GitHub.
- GitHub Pages: aktifkan **Settings → Pages → Source = GitHub Actions**. Workflow
  `.github/workflows/deploy.yml` mengisi `basePath` otomatis sesuai nama repo; **kosongkan/hapus**
  logika itu bila memakai custom domain.

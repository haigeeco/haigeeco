-- Gee Co. Platform — migrasi 0007
-- Produk untuk situs publik: foto, kategori, harga customer vs harga B2B,
-- visibilitas website, dan urutan tampil.
--
-- Prinsip keamanan: `price` adalah harga B2B/kolaborasi dan TIDAK boleh terbaca
-- oleh anon. Hanya kolom aman yang diberikan ke role anon, dengan RLS yang
-- membatasi pada produk aktif dan `website_visible = true`.
--
-- IDEMPOTEN: aman dijalankan ulang. Jalankan setelah 0001–0006.

alter table public.products
  add column if not exists customer_price numeric,
  add column if not exists image_url text not null default '',
  add column if not exists category text not null default '',
  add column if not exists website_visible boolean not null default true,
  add column if not exists sort_order int not null default 0;

-- Produk lama: pakai harga yang ada sebagai harga customer awal.
update public.products
set customer_price = price
where customer_price is null;

create index if not exists products_website_idx
  on public.products (website_visible, active, sort_order, created_at desc);

-- Akses publik hanya ke kolom yang aman. Harga B2B (`price`) tidak diberikan.
revoke select on table public.products from anon;
grant select (
  id,
  name,
  description,
  category,
  unit,
  customer_price,
  image_url,
  active,
  website_visible,
  sort_order
) on table public.products to anon;

drop policy if exists products_public_read on public.products;
create policy products_public_read on public.products
  for select to anon
  using ( active = true and website_visible = true );

notify pgrst, 'reload schema';

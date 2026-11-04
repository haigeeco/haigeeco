-- Gee Co. Platform — migrasi 0003
-- Daftar harga khusus per klien (beda harga per cafe), dengan tanggal berlaku.
--
-- Model: harga untuk (klien, produk) ditentukan oleh baris terbaru dengan
-- `effective_from` <= tanggal invoice. Bila tidak ada, dipakai `products.price`.
-- Invoice lama tetap aman karena harga disnapshot ke kolom `invoices.items`.
--
-- IDEMPOTEN: aman dijalankan ulang. Jalankan setelah 0001 dan 0002.

create table if not exists public.client_prices (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  price numeric not null,
  effective_from date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (client_id, product_id, effective_from)
);

create index if not exists client_prices_lookup_idx
  on public.client_prices (client_id, product_id, effective_from desc);

drop trigger if exists client_prices_updated_at on public.client_prices;
create trigger client_prices_updated_at
  before update on public.client_prices
  for each row execute function public.set_updated_at();

revoke all on table public.client_prices from anon, authenticated;
grant select, insert, update, delete on table public.client_prices to authenticated;
alter table public.client_prices enable row level security;

drop policy if exists client_prices_select on public.client_prices;
create policy client_prices_select on public.client_prices
  for select to authenticated
  using ( (select private.has_role(array['superuser','staff_finance']::public.app_role[])) );

drop policy if exists client_prices_insert on public.client_prices;
create policy client_prices_insert on public.client_prices
  for insert to authenticated
  with check ( (select private.has_role(array['superuser','staff_finance']::public.app_role[])) );

drop policy if exists client_prices_update on public.client_prices;
create policy client_prices_update on public.client_prices
  for update to authenticated
  using ( (select private.has_role(array['superuser','staff_finance']::public.app_role[])) )
  with check ( (select private.has_role(array['superuser','staff_finance']::public.app_role[])) );

drop policy if exists client_prices_delete on public.client_prices;
create policy client_prices_delete on public.client_prices
  for delete to authenticated
  using ( (select private.has_role(array['superuser']::public.app_role[])) );

-- Gee Co. Platform — skema awal + Row Level Security
-- Jalankan di Supabase SQL Editor (salin seluruh isi file ini -> Run).
--
-- Skrip ini IDEMPOTEN: aman dijalankan ulang, termasuk bila percobaan sebelumnya
-- sempat membuat sebagian objek. Urutan penting: tabel `profiles` dibuat lebih dulu
-- karena fungsi `private.has_role` (language sql) memvalidasi isinya saat dibuat.
--
-- Prinsip: klien memakai publishable (anon) key, dan RLS adalah satu-satunya
-- batas keamanan. Setiap tabel: revoke dari public, grant eksplisit, lalu policy.

create extension if not exists pgcrypto;

-- ============================================================ Enum
do $$ begin
  create type public.app_role as enum ('superuser', 'staff_finance', 'editor');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.invoice_status as enum ('draft', 'sent', 'paid', 'cancelled');
exception when duplicate_object then null; end $$;

-- ============================================================ Schema internal
create schema if not exists private;

-- ============================================================ updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================ profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role public.app_role,             -- null = menunggu persetujuan admin
  created_at timestamptz not null default now()
);

-- Helper anti-rekursi RLS. SECURITY DEFINER di schema tak-terekspos.
-- Dibuat SETELAH tabel profiles ada (validasi body sql saat create).
create or replace function private.has_role(roles public.app_role[])
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = any(roles)
  );
$$;

revoke execute on function private.has_role(public.app_role[]) from public;
grant usage on schema private to authenticated;
grant execute on function private.has_role(public.app_role[]) to authenticated;

-- Buat profil otomatis saat user baru mendaftar.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.email))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Cegah user menaikkan role-nya sendiri (hanya superuser yang boleh mengubah role).
create or replace function private.guard_profile_role()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Hanya batasi perubahan yang datang dari pengguna terautentikasi (punya auth.uid()).
  -- Konteks server (SQL Editor, service_role) tidak punya auth.uid() -> diizinkan.
  if new.role is distinct from old.role
     and auth.uid() is not null
     and not private.has_role(array['superuser']::public.app_role[]) then
    raise exception 'hanya superuser yang dapat mengubah role';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_guard_role on public.profiles;
create trigger profiles_guard_role
  before update on public.profiles
  for each row execute function private.guard_profile_role();

revoke all on table public.profiles from anon, authenticated;
grant select, insert, update, delete on table public.profiles to authenticated;
alter table public.profiles enable row level security;

drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select to authenticated
  using ( id = (select auth.uid()) or (select private.has_role(array['superuser']::public.app_role[])) );

drop policy if exists profiles_insert_self on public.profiles;
create policy profiles_insert_self on public.profiles
  for insert to authenticated
  with check ( id = (select auth.uid()) );

drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles
  for update to authenticated
  using ( id = (select auth.uid()) or (select private.has_role(array['superuser']::public.app_role[])) )
  with check ( id = (select auth.uid()) or (select private.has_role(array['superuser']::public.app_role[])) );

drop policy if exists profiles_delete on public.profiles;
create policy profiles_delete on public.profiles
  for delete to authenticated
  using ( (select private.has_role(array['superuser']::public.app_role[])) );

-- ============================================================ company_settings (baris tunggal)
create table if not exists public.company_settings (
  id int primary key default 1 check (id = 1),
  name text not null default 'Gee Co.',
  tagline text not null default '',
  address text not null default '',
  city text not null default '',
  phone text not null default '',
  email text not null default '',
  website text not null default '',
  npwp text not null default '',
  logo_url text not null default '',
  bank_name text not null default '',
  bank_account_number text not null default '',
  bank_account_name text not null default '',
  invoice_prefix text not null default 'GC',
  payment_term_days int not null default 14,
  tax_label text not null default 'PPN',
  tax_rate numeric not null default 11,
  tax_enabled_by_default boolean not null default false,
  default_notes text not null default '',
  terms text not null default '',
  updated_at timestamptz not null default now()
);

insert into public.company_settings (id) values (1) on conflict (id) do nothing;

drop trigger if exists company_settings_updated_at on public.company_settings;
create trigger company_settings_updated_at
  before update on public.company_settings
  for each row execute function public.set_updated_at();

revoke all on table public.company_settings from anon, authenticated;
grant select, insert, update on table public.company_settings to authenticated;
alter table public.company_settings enable row level security;

drop policy if exists settings_select on public.company_settings;
create policy settings_select on public.company_settings
  for select to authenticated
  using ( (select auth.uid()) is not null );

drop policy if exists settings_update on public.company_settings;
create policy settings_update on public.company_settings
  for update to authenticated
  using ( (select private.has_role(array['superuser']::public.app_role[])) )
  with check ( (select private.has_role(array['superuser']::public.app_role[])) );

-- ============================================================ clients
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact_person text not null default '',
  phone text not null default '',
  email text not null default '',
  address text not null default '',
  city text not null default '',
  npwp text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists clients_updated_at on public.clients;
create trigger clients_updated_at
  before update on public.clients
  for each row execute function public.set_updated_at();

revoke all on table public.clients from anon, authenticated;
grant select, insert, update, delete on table public.clients to authenticated;
alter table public.clients enable row level security;

drop policy if exists clients_select on public.clients;
create policy clients_select on public.clients
  for select to authenticated
  using ( (select private.has_role(array['superuser','staff_finance']::public.app_role[])) );

drop policy if exists clients_insert on public.clients;
create policy clients_insert on public.clients
  for insert to authenticated
  with check ( (select private.has_role(array['superuser','staff_finance']::public.app_role[])) );

drop policy if exists clients_update on public.clients;
create policy clients_update on public.clients
  for update to authenticated
  using ( (select private.has_role(array['superuser','staff_finance']::public.app_role[])) )
  with check ( (select private.has_role(array['superuser','staff_finance']::public.app_role[])) );

drop policy if exists clients_delete on public.clients;
create policy clients_delete on public.clients
  for delete to authenticated
  using ( (select private.has_role(array['superuser']::public.app_role[])) );

-- ============================================================ products
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  sku text not null default '',
  name text not null,
  description text not null default '',
  unit text not null default '',
  price numeric not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists products_updated_at on public.products;
create trigger products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

revoke all on table public.products from anon, authenticated;
grant select, insert, update, delete on table public.products to authenticated;
alter table public.products enable row level security;

drop policy if exists products_select on public.products;
create policy products_select on public.products
  for select to authenticated
  using ( (select private.has_role(array['superuser','staff_finance']::public.app_role[])) );

drop policy if exists products_insert on public.products;
create policy products_insert on public.products
  for insert to authenticated
  with check ( (select private.has_role(array['superuser','staff_finance']::public.app_role[])) );

drop policy if exists products_update on public.products;
create policy products_update on public.products
  for update to authenticated
  using ( (select private.has_role(array['superuser','staff_finance']::public.app_role[])) )
  with check ( (select private.has_role(array['superuser','staff_finance']::public.app_role[])) );

drop policy if exists products_delete on public.products;
create policy products_delete on public.products
  for delete to authenticated
  using ( (select private.has_role(array['superuser']::public.app_role[])) );

-- ============================================================ invoice_sequences
-- Tanpa akses langsung; hanya lewat fungsi SECURITY DEFINER di bawah.
create table if not exists public.invoice_sequences (
  year int primary key,
  last_seq int not null default 0
);

revoke all on table public.invoice_sequences from anon, authenticated;
alter table public.invoice_sequences enable row level security;

-- Nomor invoice atomik (aman lintas-tab): lock baris tahun lalu increment.
create or replace function public.next_invoice_number(p_prefix text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_year int := extract(year from now())::int;
  v_seq int;
begin
  insert into public.invoice_sequences (year, last_seq)
  values (v_year, 0)
  on conflict (year) do nothing;

  update public.invoice_sequences
  set last_seq = last_seq + 1
  where year = v_year
  returning last_seq into v_seq;

  return coalesce(nullif(p_prefix, ''), 'INV') || '/' || v_year || '/' || lpad(v_seq::text, 4, '0');
end;
$$;

-- Pratinjau tanpa menaikkan counter.
create or replace function public.peek_invoice_number(p_prefix text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_year int := extract(year from now())::int;
  v_seq int;
begin
  select last_seq + 1 into v_seq from public.invoice_sequences where year = v_year;
  v_seq := coalesce(v_seq, 1);
  return coalesce(nullif(p_prefix, ''), 'INV') || '/' || v_year || '/' || lpad(v_seq::text, 4, '0');
end;
$$;

revoke execute on function public.next_invoice_number(text) from public;
revoke execute on function public.peek_invoice_number(text) from public;
grant execute on function public.next_invoice_number(text) to authenticated;
grant execute on function public.peek_invoice_number(text) to authenticated;

-- ============================================================ invoices
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  number text not null unique,
  client_id uuid references public.clients(id) on delete set null,
  client_snapshot jsonb not null default '{}'::jsonb,
  issue_date date,
  due_date date,
  delivery_date date,
  items jsonb not null default '[]'::jsonb,
  discount numeric not null default 0,
  shipping_cost numeric not null default 0,
  tax_enabled boolean not null default false,
  tax_label text not null default 'PPN',
  tax_rate numeric not null default 0,
  down_payment numeric not null default 0,
  notes text not null default '',
  status public.invoice_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  paid_at timestamptz
);

create index if not exists invoices_created_at_idx on public.invoices (created_at desc);
create index if not exists invoices_status_idx on public.invoices (status);

drop trigger if exists invoices_updated_at on public.invoices;
create trigger invoices_updated_at
  before update on public.invoices
  for each row execute function public.set_updated_at();

revoke all on table public.invoices from anon, authenticated;
grant select, insert, update, delete on table public.invoices to authenticated;
alter table public.invoices enable row level security;

drop policy if exists invoices_select on public.invoices;
create policy invoices_select on public.invoices
  for select to authenticated
  using ( (select private.has_role(array['superuser','staff_finance']::public.app_role[])) );

drop policy if exists invoices_insert on public.invoices;
create policy invoices_insert on public.invoices
  for insert to authenticated
  with check ( (select private.has_role(array['superuser','staff_finance']::public.app_role[])) );

drop policy if exists invoices_update on public.invoices;
create policy invoices_update on public.invoices
  for update to authenticated
  using ( (select private.has_role(array['superuser','staff_finance']::public.app_role[])) )
  with check ( (select private.has_role(array['superuser','staff_finance']::public.app_role[])) );

drop policy if exists invoices_delete on public.invoices;
create policy invoices_delete on public.invoices
  for delete to authenticated
  using ( (select private.has_role(array['superuser']::public.app_role[])) );

-- ============================================================ blog_posts
create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text not null default '',
  content_md text not null default '',
  cover_image_url text not null default '',
  published boolean not null default false,
  published_at timestamptz,
  author_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists blog_posts_published_idx on public.blog_posts (published, published_at desc);

drop trigger if exists blog_posts_updated_at on public.blog_posts;
create trigger blog_posts_updated_at
  before update on public.blog_posts
  for each row execute function public.set_updated_at();

revoke all on table public.blog_posts from anon, authenticated;
grant select on table public.blog_posts to anon, authenticated;
grant insert, update, delete on table public.blog_posts to authenticated;
alter table public.blog_posts enable row level security;

-- Publik hanya membaca yang sudah terbit.
drop policy if exists blog_public_read on public.blog_posts;
create policy blog_public_read on public.blog_posts
  for select to anon, authenticated
  using ( published = true );

-- Editor/superuser membaca semua (termasuk draft).
drop policy if exists blog_staff_read on public.blog_posts;
create policy blog_staff_read on public.blog_posts
  for select to authenticated
  using ( (select private.has_role(array['superuser','editor']::public.app_role[])) );

drop policy if exists blog_staff_insert on public.blog_posts;
create policy blog_staff_insert on public.blog_posts
  for insert to authenticated
  with check ( (select private.has_role(array['superuser','editor']::public.app_role[])) );

drop policy if exists blog_staff_update on public.blog_posts;
create policy blog_staff_update on public.blog_posts
  for update to authenticated
  using ( (select private.has_role(array['superuser','editor']::public.app_role[])) )
  with check ( (select private.has_role(array['superuser','editor']::public.app_role[])) );

drop policy if exists blog_staff_delete on public.blog_posts;
create policy blog_staff_delete on public.blog_posts
  for delete to authenticated
  using ( (select private.has_role(array['superuser','editor']::public.app_role[])) );

-- ============================================================ Storage (aset publik)
insert into storage.buckets (id, name, public)
values ('public-assets', 'public-assets', true)
on conflict (id) do nothing;

drop policy if exists assets_public_read on storage.objects;
create policy assets_public_read on storage.objects
  for select to anon, authenticated
  using ( bucket_id = 'public-assets' );

drop policy if exists assets_staff_insert on storage.objects;
create policy assets_staff_insert on storage.objects
  for insert to authenticated
  with check ( bucket_id = 'public-assets'
    and (select private.has_role(array['superuser','editor','staff_finance']::public.app_role[])) );

drop policy if exists assets_staff_update on storage.objects;
create policy assets_staff_update on storage.objects
  for update to authenticated
  using ( bucket_id = 'public-assets'
    and (select private.has_role(array['superuser','editor','staff_finance']::public.app_role[])) );

drop policy if exists assets_staff_delete on storage.objects;
create policy assets_staff_delete on storage.objects
  for delete to authenticated
  using ( bucket_id = 'public-assets'
    and (select private.has_role(array['superuser','editor']::public.app_role[])) );

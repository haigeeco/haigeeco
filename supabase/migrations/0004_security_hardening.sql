-- Gee Co. Platform — migrasi 0004
-- Pengerasan keamanan + kolom deploy hook.
--
-- IDEMPOTEN: aman dijalankan ulang. Jalankan setelah 0001, 0002, 0003.

-- 1) Cegah user mengeset perannya sendiri saat membuat baris profil.
--    Sebelumnya `with check (id = auth.uid())` membiarkan kolom `role` diisi apa saja;
--    bila baris profil sempat hilang, user bisa memasukkan dirinya sebagai superuser.
drop policy if exists profiles_insert_self on public.profiles;
create policy profiles_insert_self on public.profiles
  for insert to authenticated
  with check ( id = (select auth.uid()) and role is null );

-- 2) Nomor invoice hanya boleh dibuat/dilihat oleh superuser & staff_finance.
--    Kedua fungsi SECURITY DEFINER ini menembus RLS tabel invoice_sequences,
--    jadi wajib memeriksa peran sendiri.
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
  if not private.has_role(array['superuser','staff_finance']::public.app_role[]) then
    raise exception 'tidak berwenang membuat nomor invoice' using errcode = '42501';
  end if;

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
  if not private.has_role(array['superuser','staff_finance']::public.app_role[]) then
    raise exception 'tidak berwenang melihat nomor invoice' using errcode = '42501';
  end if;

  select last_seq + 1 into v_seq from public.invoice_sequences where year = v_year;
  v_seq := coalesce(v_seq, 1);
  return coalesce(nullif(p_prefix, ''), 'INV') || '/' || v_year || '/' || lpad(v_seq::text, 4, '0');
end;
$$;

revoke execute on function public.next_invoice_number(text) from public;
revoke execute on function public.peek_invoice_number(text) from public;
grant execute on function public.next_invoice_number(text) to authenticated;
grant execute on function public.peek_invoice_number(text) to authenticated;

-- 3) Harga khusus klien boleh dihapus staff_finance juga: data operasional harian,
--    dan invoice lama tetap aman karena harga disnapshot ke invoices.items.
drop policy if exists client_prices_delete on public.client_prices;
create policy client_prices_delete on public.client_prices
  for delete to authenticated
  using ( (select private.has_role(array['superuser','staff_finance']::public.app_role[])) );

-- 4) URL deploy hook dipindah dari bundle klien (NEXT_PUBLIC_*) ke settings.
--    Hanya superuser yang boleh mengubahnya (policy settings_update).
alter table public.company_settings add column if not exists deploy_hook_url text not null default '';

-- Gee Co. Platform — migrasi 0006
-- Memindahkan URL deploy hook keluar dari `company_settings`.
--
-- Alasan: policy `settings_select` (0005) mengizinkan peran editor membaca seluruh
-- baris pengaturan, sehingga URL build hook (rahasia: siapa pun yang memilikinya
-- bisa memicu rebuild) ikut terbaca. Nilainya kini disimpan di `site_config`
-- (khusus superuser) dan dipakai server-side oleh Edge Function `rebuild-site`.
--
-- IDEMPOTEN: aman dijalankan ulang. Jalankan setelah 0001–0005.

create table if not exists public.site_config (
  id int primary key default 1 check (id = 1),
  deploy_hook_url text not null default '',
  updated_at timestamptz not null default now()
);

insert into public.site_config (id) values (1) on conflict (id) do nothing;

-- Salin nilai lama (bila kolomnya masih ada), lalu buang kolomnya.
do $$
declare
  v_url text := '';
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'company_settings'
      and column_name = 'deploy_hook_url'
  ) then
    execute 'select deploy_hook_url from public.company_settings where id = 1' into v_url;
    if coalesce(v_url, '') <> '' then
      update public.site_config set deploy_hook_url = v_url where id = 1;
    end if;
    execute 'alter table public.company_settings drop column deploy_hook_url';
  end if;
end $$;

drop trigger if exists site_config_updated_at on public.site_config;
create trigger site_config_updated_at
  before update on public.site_config
  for each row execute function public.set_updated_at();

revoke all on table public.site_config from anon, authenticated;
grant select, update on table public.site_config to authenticated;
alter table public.site_config enable row level security;

drop policy if exists site_config_select on public.site_config;
create policy site_config_select on public.site_config
  for select to authenticated
  using ( (select private.has_role(array['superuser']::public.app_role[])) );

drop policy if exists site_config_update on public.site_config;
create policy site_config_update on public.site_config
  for update to authenticated
  using ( (select private.has_role(array['superuser']::public.app_role[])) )
  with check ( (select private.has_role(array['superuser']::public.app_role[])) );

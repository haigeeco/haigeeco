-- Gee Co. Platform — migrasi 0008
-- Username untuk login (email ATAU username) dan identitas tim.
--
-- Username disimpan lowercase, unik, 3-30 karakter, hanya huruf kecil/angka/
-- titik/garis bawah/strip. Login via username ditangani Edge Function `login`
-- dengan service_role, jadi tabel profiles tidak perlu dibuka ke anon.
--
-- IDEMPOTEN: aman dijalankan ulang. Jalankan setelah 0001–0007.

alter table public.profiles add column if not exists username text;

-- Backfill profil lama dari bagian lokal email, dengan suffix bila bentrok.
do $$
declare
  r record;
  base text;
  candidate text;
  n int;
begin
  for r in
    select id, email
    from public.profiles
    where username is null and email is not null
    order by created_at
  loop
    base := left(lower(regexp_replace(split_part(r.email, '@', 1), '[^a-z0-9._-]', '', 'g')), 30);
    if length(base) < 3 then
      base := 'user';
    end if;

    candidate := base;
    n := 0;
    while exists (
      select 1 from public.profiles
      where lower(username) = lower(candidate)
    ) loop
      n := n + 1;
      candidate := left(base, 26) || n::text;
    end loop;

    update public.profiles set username = candidate where id = r.id;
  end loop;
end $$;

-- Normalisasi otomatis agar konsisten walau dikirim dengan huruf besar.
create or replace function private.normalize_profile_username()
returns trigger
language plpgsql
as $$
begin
  new.username := nullif(lower(trim(new.username)), '');
  return new;
end;
$$;

drop trigger if exists profiles_normalize_username on public.profiles;
create trigger profiles_normalize_username
  before insert or update of username on public.profiles
  for each row execute function private.normalize_profile_username();

alter table public.profiles drop constraint if exists profiles_username_format;
alter table public.profiles
  add constraint profiles_username_format
  check (username is null or username ~ '^[a-z0-9._-]{3,30}$');

create unique index if not exists profiles_username_unique
  on public.profiles (lower(username))
  where username is not null;

notify pgrst, 'reload schema';

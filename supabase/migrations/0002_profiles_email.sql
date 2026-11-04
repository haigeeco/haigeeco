-- Gee Co. Platform — migrasi 0002
-- Menyimpan email di public.profiles agar admin bisa menampilkan alamat login
-- (auth.users tidak bisa dibaca dari klien). IDEMPOTEN: aman dijalankan ulang.
--
-- Jalankan di Supabase SQL Editor setelah 0001_init.sql.

alter table public.profiles add column if not exists email text;

-- Backfill dari auth.users untuk profil yang sudah ada.
update public.profiles p
set email = u.email
from auth.users u
where p.id = u.id and p.email is null;

-- Sertakan email saat profil dibuat otomatis.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.email), new.email)
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

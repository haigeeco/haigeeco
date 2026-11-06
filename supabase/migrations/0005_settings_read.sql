-- Gee Co. Platform — migrasi 0005
-- Batasi baca `company_settings` ke peran yang benar-benar membutuhkannya
-- (superuser, staff_finance, editor). Sebelumnya policy `auth.uid() is not null`
-- membuat akun "menunggu persetujuan" (role masih null) tetap bisa membaca
-- pengaturan internal (mis. URL deploy hook).
--
-- IDEMPOTEN: aman dijalankan ulang. Jalankan setelah 0001–0004.

drop policy if exists settings_select on public.company_settings;
create policy settings_select on public.company_settings
  for select to authenticated
  using (
    (select private.has_role(array['superuser','staff_finance','editor']::public.app_role[]))
  );

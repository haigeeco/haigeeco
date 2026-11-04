// Supabase Edge Function: admin-users
// Membuat & menghapus akun Supabase Auth. Hanya boleh dipanggil oleh superuser.
// Jalankan di server (memakai service_role key yang otomatis tersedia di runtime),
// sehingga klien tetap hanya berpegangan pada publishable (anon) key.
//
// Deploy:
//   supabase functions deploy admin-users
// (verify_jwt default aktif; fungsi tetap memverifikasi peran superuser sendiri.)

import { createClient } from "npm:@supabase/supabase-js@2";
import { normalizeEmail, validateCreate } from "./validate.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Metode tidak diizinkan." }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  // Proyek lama menyuntik SUPABASE_ANON_KEY; proyek dengan API key baru memakai
  // SUPABASE_PUBLISHABLE_KEY. Terima keduanya.
  const anonKey =
    Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !anonKey || !serviceKey) {
    return json({ error: "Konfigurasi server tidak lengkap." }, 500);
  }

  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) return json({ error: "Tidak terautentikasi." }, 401);

  // Klien memakai JWT pemanggil untuk memverifikasi identitas + peran.
  const caller = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: userData, error: userError } = await caller.auth.getUser();
  if (userError || !userData.user) return json({ error: "Sesi tidak valid." }, 401);

  const { data: profile } = await caller
    .from("profiles")
    .select("role")
    .eq("id", userData.user.id)
    .maybeSingle();
  if (profile?.role !== "superuser") return json({ error: "Hanya superuser." }, 403);

  // Klien admin (service_role) — hanya dipakai di server.
  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  let payload: Record<string, unknown>;
  try {
    payload = (await req.json()) as Record<string, unknown>;
  } catch {
    return json({ error: "Body tidak valid." }, 400);
  }

  const action = String(payload.action ?? "");

  if (action === "create") {
    const email = normalizeEmail(payload.email);
    const password = String(payload.password ?? "");
    const fullName = String(payload.full_name ?? "").trim();
    const role = String(payload.role ?? "");

    const invalid = validateCreate({ email, password, role });
    if (invalid) return json({ error: invalid }, 400);

    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName || email },
    });
    if (createError || !created.user) {
      return json({ error: createError?.message ?? "Gagal membuat akun." }, 400);
    }

    // Trigger handle_new_user sudah membuat baris profil; tetapkan nama & peran final.
    const { error: profileError } = await admin
      .from("profiles")
      .upsert({ id: created.user.id, full_name: fullName || email, email, role });
    if (profileError) return json({ error: profileError.message }, 400);

    return json({ id: created.user.id });
  }

  if (action === "delete") {
    const id = String(payload.id ?? "");
    if (!id) return json({ error: "id wajib diisi." }, 400);
    if (id === userData.user.id) {
      return json({ error: "Tidak bisa menghapus akun sendiri." }, 400);
    }

    const { error } = await admin.auth.admin.deleteUser(id);
    if (error) return json({ error: error.message }, 400);
    return json({ ok: true });
  }

  return json({ error: "Aksi tidak dikenal." }, 400);
});

// Supabase Edge Function: login
// Autentikasi dengan email ATAU username + kata sandi.
//
// Username diubah menjadi email di server (service_role), lalu email + kata sandi
// diverifikasi ke endpoint Auth Supabase. Email tidak pernah dikirim ke klien,
// sehingga daftar username tidak membocorkan alamat email pengguna.
//
// Deploy:
//   supabase functions deploy login
// verify_jwt = false (fungsi ini dipanggil saat belum punya sesi).

import { createClient } from "npm:@supabase/supabase-js@2";

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
  const anonKey =
    Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !anonKey || !serviceKey) {
    return json({ error: "Konfigurasi server tidak lengkap." }, 500);
  }

  let payload: { identifier?: unknown; password?: unknown };
  try {
    payload = (await req.json()) as { identifier?: unknown; password?: unknown };
  } catch {
    return json({ error: "Body tidak valid." }, 400);
  }

  const identifier = String(payload.identifier ?? "").trim();
  const password = String(payload.password ?? "");
  if (!identifier || !password) {
    return json({ error: "Email/username dan kata sandi wajib diisi." }, 400);
  }

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  let email = identifier;

  if (!identifier.includes("@")) {
    const username = identifier.toLowerCase();
    const { data, error } = await admin
      .from("profiles")
      .select("email")
      .eq("username", username)
      .maybeSingle();

    if (error) return json({ error: "Login belum dikonfigurasi." }, 500);
    if (!data?.email) {
      // Pesan generik agar tidak bisa dipakai menebak username yang ada.
      return json({ error: "Email/username atau kata sandi salah." }, 401);
    }
    email = data.email as string;
  }

  const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: anonKey,
    },
    body: JSON.stringify({ email, password }),
  });

  const result = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok) {
    return json({ error: "Email/username atau kata sandi salah." }, 401);
  }

  return json(result);
});

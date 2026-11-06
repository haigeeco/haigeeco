// Supabase Edge Function: rebuild-site
// Memicu Cloudflare Deploy Hook agar situs publik dibangun ulang setelah artikel
// blog diterbitkan. URL hook disimpan di `site_config` yang hanya bisa dibaca
// superuser — fungsi ini membacanya dengan service_role sehingga peran editor
// tidak pernah melihat URL-nya.
//
// Deploy:
//   supabase functions deploy rebuild-site
// (verify_jwt default aktif; peran superuser/editor diverifikasi lagi di fungsi.)

import { createClient } from "npm:@supabase/supabase-js@2";
import { canTriggerRebuild, normalizeHookUrl } from "./validate.ts";

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

  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) return json({ error: "Tidak terautentikasi." }, 401);

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
  if (!canTriggerRebuild(profile?.role)) {
    return json({ error: "Hanya superuser atau editor." }, 403);
  }

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: config, error: configError } = await admin
    .from("site_config")
    .select("deploy_hook_url")
    .eq("id", 1)
    .maybeSingle();
  if (configError) return json({ error: "Gagal membaca konfigurasi situs." }, 500);

  const hookUrl = normalizeHookUrl(config?.deploy_hook_url);
  if (!hookUrl) return json({ ok: true, skipped: true });

  try {
    const response = await fetch(hookUrl, { method: "POST" });
    if (!response.ok) {
      return json({ error: `Deploy hook menolak permintaan (${response.status}).` }, 502);
    }
    return json({ ok: true });
  } catch {
    return json({ error: "Tidak bisa menghubungi deploy hook." }, 502);
  }
});

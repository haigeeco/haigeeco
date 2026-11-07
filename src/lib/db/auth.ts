"use client";

import { getSupabase } from "@/lib/supabase/client";

interface LoginResponse {
  access_token?: string;
  refresh_token?: string;
  error?: string;
}

export async function signInWithIdentifier(identifier: string, password: string): Promise<void> {
  const supabase = getSupabase();
  const value = identifier.trim();

  // Login email tetap langsung ke Supabase Auth, tidak bergantung pada Edge Function.
  if (value.includes("@")) {
    const { error } = await supabase.auth.signInWithPassword({ email: value, password });
    if (error) throw error;
    return;
  }

  // Login username: resolve username -> email di server lewat Edge Function `login`.
  const { data, error } = await supabase.functions.invoke("login", {
    body: { identifier: value, password },
  });

  const body = (data ?? {}) as LoginResponse;

  if (error) {
    let message = body.error || error.message || "Gagal masuk.";
    const context = (error as { context?: Response }).context;
    if (context && typeof context.json === "function") {
      try {
        const parsed = (await context.json()) as LoginResponse;
        if (parsed?.error) message = parsed.error;
      } catch {
        // Respons bukan JSON, pakai pesan default.
      }
    }
    if (/failed to send|not found|404|edge function/i.test(message)) {
      message = "Login via username belum aktif. Gunakan email atau hubungi admin.";
    }
    throw new Error(message);
  }

  if (body.error) throw new Error(body.error);
  if (!body.access_token || !body.refresh_token) {
    throw new Error("Respons login tidak valid.");
  }

  const { error: sessionError } = await supabase.auth.setSession({
    access_token: body.access_token,
    refresh_token: body.refresh_token,
  });
  if (sessionError) throw sessionError;
}

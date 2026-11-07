"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { signInWithIdentifier } from "@/lib/db/auth";
import { DEFAULT_LOGO_URL } from "@/lib/domain";
import { Input } from "@/components/ui";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    getSupabase()
      .auth.getSession()
      .then(({ data }) => {
        if (data.session) router.replace("/admin");
      });
  }, [router]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (!isSupabaseConfigured) {
      setError("Supabase belum dikonfigurasi. Isi NEXT_PUBLIC_SUPABASE_URL dan key terlebih dahulu.");
      return;
    }
    setBusy(true);
    try {
      await signInWithIdentifier(identifier.trim(), password);
      router.replace("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan. Coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-cream px-4 py-10">
      <div className="relative w-full max-w-sm">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white p-1.5 shadow-sm ring-1 ring-line">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={DEFAULT_LOGO_URL} alt="" className="h-full w-full object-contain" />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight text-ink">
            Gee Co.
          </span>
        </Link>

        <div className="rounded-3xl border border-line bg-white p-7 shadow-sm">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">
            Masuk ke sistem
          </h1>
          <p className="mt-1 text-sm text-ink-soft">Kelola invoice dan konten Gee Co.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-ink" htmlFor="identifier">
                Email atau username
              </label>
              <Input
                id="identifier"
                type="text"
                required
                autoComplete="username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="nama@geeco.id atau rina"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-ink" htmlFor="password">
                Kata sandi
              </label>
              <Input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            {error ? (
              <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-full bg-pistachio px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-pistachio-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? "Memproses…" : "Masuk"}
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-ink-soft/70">
            Belum punya akun? Hubungi superuser untuk dibuatkan akses.
          </p>
        </div>
      </div>
    </div>
  );
}

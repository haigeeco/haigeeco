"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { profileMeKey, useCurrentProfile } from "@/lib/db/users";

export function AdminGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const profileQuery = useCurrentProfile();

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const {
      data: { subscription },
    } = getSupabase().auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        queryClient.setQueryData(profileMeKey, null);
        router.replace("/login");
      } else if (event === "SIGNED_IN") {
        queryClient.invalidateQueries({ queryKey: profileMeKey });
      }
    });
    return () => subscription.unsubscribe();
  }, [queryClient, router]);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    if (!profileQuery.isLoading && profileQuery.data === null) router.replace("/login");
  }, [profileQuery.isLoading, profileQuery.data, router]);

  if (!isSupabaseConfigured) return <>{children}</>;

  if (profileQuery.isLoading) {
    return <div className="p-10 text-sm text-slate-500">Memeriksa sesi…</div>;
  }

  if (profileQuery.isError) {
    return (
      <div className="p-10 text-sm text-rose-600">
        Gagal memeriksa sesi. Coba muat ulang halaman.
      </div>
    );
  }

  const profile = profileQuery.data;
  if (!profile) {
    return null;
  }

  if (!profile.role) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="text-lg font-semibold text-slate-900">Menunggu persetujuan admin</h1>
        <p className="mt-2 text-sm text-slate-600">
          Akun Anda sudah terdaftar, tetapi belum diberi akses. Hubungi superuser Gee Co. untuk
          mengaktifkan peran Anda.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSupabase } from "@/lib/supabase/client";
import type { AppRole, Profile } from "@/lib/types";

const ME_KEY = ["profile", "me"] as const;
const LIST_KEY = ["profiles"] as const;

export const profileMeKey = ME_KEY;

export function useCurrentProfile() {
  return useQuery({
    queryKey: ME_KEY,
    queryFn: async (): Promise<Profile | null> => {
      const {
        data: { user },
      } = await getSupabase().auth.getUser();
      if (!user) return null;
      const { data, error } = await getSupabase()
        .from("profiles")
        .select("id,full_name,email,role,created_at")
        .eq("id", user.id)
        .maybeSingle();
      if (error) throw error;
      // Sesi ada tapi baris profil belum ada (mis. trigger gagal) → anggap "menunggu
      // persetujuan", bukan "belum login"; kalau null, AdminGuard akan memantulkan ke
      // /login sementara /login memantulkan balik → loop.
      return (
        (data as Profile) ?? {
          id: user.id,
          full_name: user.user_metadata?.full_name ?? user.email ?? null,
          email: user.email ?? null,
          role: null,
          created_at: "",
        }
      );
    },
  });
}

export function useProfiles() {
  return useQuery({
    queryKey: LIST_KEY,
    queryFn: async (): Promise<Profile[]> => {
      const { data, error } = await getSupabase()
        .from("profiles")
        .select("id,full_name,email,role,created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Profile[];
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      full_name,
      role,
    }: {
      id: string;
      full_name: string;
      role: AppRole | null;
    }) => {
      const { error } = await getSupabase()
        .from("profiles")
        .update({ full_name, role })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LIST_KEY });
      queryClient.invalidateQueries({ queryKey: ME_KEY });
    },
  });
}

async function functionErrorMessage(error: unknown, data: unknown): Promise<string> {
  const bodyError = (data as { error?: string } | null)?.error;
  if (bodyError) return bodyError;
  const context = (error as { context?: Response }).context;
  if (context && typeof context.json === "function") {
    try {
      const body = (await context.json()) as { error?: string };
      if (body?.error) return body.error;
    } catch {
      // respons bukan JSON — abaikan
    }
  }
  return error instanceof Error ? error.message : "Terjadi kesalahan.";
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      email: string;
      password: string;
      full_name: string;
      role: AppRole;
    }) => {
      const { data, error } = await getSupabase().functions.invoke("admin-users", {
        body: { action: "create", ...input },
      });
      if (error) throw new Error(await functionErrorMessage(error, data));
      const bodyError = (data as { error?: string } | null)?.error;
      if (bodyError) throw new Error(bodyError);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: LIST_KEY }),
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await getSupabase().functions.invoke("admin-users", {
        body: { action: "delete", id },
      });
      if (error) throw new Error(await functionErrorMessage(error, data));
      const bodyError = (data as { error?: string } | null)?.error;
      if (bodyError) throw new Error(bodyError);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: LIST_KEY }),
  });
}

export function canManageBlog(role: AppRole | null | undefined): boolean {
  return role === "superuser" || role === "editor";
}

export const ROLE_LABELS: Record<AppRole, string> = {
  superuser: "Superuser",
  staff_finance: "Staff Finance",
  editor: "Editor",
};

export function roleLabel(role: AppRole | null | undefined): string {
  return role ? ROLE_LABELS[role] : "Menunggu persetujuan";
}

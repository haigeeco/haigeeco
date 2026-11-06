"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSupabase } from "@/lib/supabase/client";

const KEY = ["site-config"] as const;

export function useDeployHookUrl() {
  return useQuery({
    queryKey: KEY,
    queryFn: async (): Promise<string> => {
      const { data, error } = await getSupabase()
        .from("site_config")
        .select("deploy_hook_url")
        .eq("id", 1)
        .maybeSingle();
      if (error) throw error;
      return (data?.deploy_hook_url as string | undefined) ?? "";
    },
  });
}

export function useSaveDeployHookUrl() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (url: string) => {
      const { error } = await getSupabase()
        .from("site_config")
        .update({ deploy_hook_url: url.trim() })
        .eq("id", 1);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export async function triggerSiteRebuild(): Promise<void> {
  try {
    const { error } = await getSupabase().functions.invoke("rebuild-site");
    if (error) throw error;
  } catch {
    // Non-fatal: artikel tetap tersimpan walau rebuild gagal dipicu.
  }
}

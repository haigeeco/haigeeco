"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSupabase } from "@/lib/supabase/client";
import type { CompanySettings } from "@/lib/types";
import { defaultSettings } from "@/lib/domain";
import { settingsToRow, toSettings, type SettingsRow } from "./mappers";

const KEY = ["settings"] as const;

export function useSettings() {
  return useQuery({
    queryKey: KEY,
    queryFn: async (): Promise<CompanySettings> => {
      const { data, error } = await getSupabase()
        .from("company_settings")
        .select("*")
        .eq("id", 1)
        .maybeSingle();
      if (error) throw error;
      return data ? toSettings(data as SettingsRow) : defaultSettings();
    },
  });
}

export function useSaveSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (settings: CompanySettings) => {
      const { error } = await getSupabase()
        .from("company_settings")
        .update(settingsToRow(settings))
        .eq("id", 1);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSupabase } from "@/lib/supabase/client";
import type { Client } from "@/lib/types";
import { nowIso } from "@/lib/ids";
import { clientToRow, toClient, type ClientRow } from "./mappers";

const KEY = ["clients"] as const;

export function useClients() {
  return useQuery({
    queryKey: KEY,
    queryFn: async (): Promise<Client[]> => {
      const { data, error } = await getSupabase()
        .from("clients")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return ((data ?? []) as ClientRow[]).map(toClient);
    },
  });
}

export function useUpsertClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (client: Client) => {
      const { error } = await getSupabase()
        .from("clients")
        .upsert(clientToRow({ ...client, updatedAt: nowIso() }));
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await getSupabase().from("clients").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSupabase } from "@/lib/supabase/client";
import type { ClientPrice } from "@/lib/types";
import { nowIso } from "@/lib/ids";
import { clientPriceToRow, toClientPrice, type ClientPriceRow } from "./mappers";

const KEY = ["client-prices"] as const;

export function useClientPrices() {
  return useQuery({
    queryKey: KEY,
    queryFn: async (): Promise<ClientPrice[]> => {
      const { data, error } = await getSupabase()
        .from("client_prices")
        .select("*")
        .order("effective_from", { ascending: false });
      if (error) throw error;
      return ((data ?? []) as ClientPriceRow[]).map(toClientPrice);
    },
  });
}

export function useSaveClientPrice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (price: ClientPrice) => {
      const { error } = await getSupabase()
        .from("client_prices")
        .upsert(clientPriceToRow({ ...price, updatedAt: nowIso() }));
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteClientPrice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await getSupabase().from("client_prices").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

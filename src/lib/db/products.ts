"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSupabase } from "@/lib/supabase/client";
import type { Product } from "@/lib/types";
import { nowIso } from "@/lib/ids";
import { productToRow, toProduct, type ProductRow } from "./mappers";

const KEY = ["products"] as const;

export function useProducts() {
  return useQuery({
    queryKey: KEY,
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await getSupabase()
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return ((data ?? []) as ProductRow[]).map(toProduct);
    },
  });
}

export function useUpsertProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (product: Product) => {
      const { error } = await getSupabase()
        .from("products")
        .upsert(productToRow({ ...product, updatedAt: nowIso() }));
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await getSupabase().from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

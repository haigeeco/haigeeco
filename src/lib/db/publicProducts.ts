"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchPublicProducts } from "@/lib/public-products";
import type { SeoProduct } from "@/lib/seo-content";

export function usePublicProducts(initialData: SeoProduct[]) {
  return useQuery({
    queryKey: ["public-products"],
    queryFn: fetchPublicProducts,
    initialData,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
    retry: 0,
  });
}

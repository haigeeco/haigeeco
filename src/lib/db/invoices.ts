"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSupabase } from "@/lib/supabase/client";
import type { Invoice, InvoiceStatus } from "@/lib/types";
import { nowIso } from "@/lib/ids";
import {
  invoiceInsert,
  invoiceUpdate,
  toInvoice,
  type InvoiceDraft,
  type InvoiceRow,
} from "./mappers";

const KEY = ["invoices"] as const;

export function useInvoices() {
  return useQuery({
    queryKey: KEY,
    queryFn: async (): Promise<Invoice[]> => {
      const { data, error } = await getSupabase()
        .from("invoices")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return ((data ?? []) as InvoiceRow[]).map(toInvoice);
    },
  });
}

export function useNextInvoiceNumber(prefix: string | undefined) {
  return useQuery({
    queryKey: ["invoice-number", prefix],
    enabled: Boolean(prefix),
    queryFn: async (): Promise<string> => {
      const { data, error } = await getSupabase().rpc("peek_invoice_number", {
        p_prefix: prefix,
      });
      if (error) throw error;
      return data as string;
    },
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      draft,
      prefix,
    }: {
      draft: InvoiceDraft;
      prefix: string;
    }): Promise<Invoice> => {
      const supabase = getSupabase();
      const { data: number, error: numberError } = await supabase.rpc("next_invoice_number", {
        p_prefix: prefix,
      });
      if (numberError) throw numberError;
      const { data, error } = await supabase
        .from("invoices")
        .insert({
          ...invoiceInsert(draft, number as string),
          ...(draft.status === "paid" ? { paid_at: nowIso() } : {}),
        })
        .select("*")
        .single();
      if (error) throw error;
      return toInvoice(data as InvoiceRow);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (invoice: Invoice) => {
      const { error } = await getSupabase()
        .from("invoices")
        .update(invoiceUpdate(invoice))
        .eq("id", invoice.id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useSetInvoiceStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ invoice, status }: { invoice: Invoice; status: InvoiceStatus }) => {
      const paidAt = status === "paid" ? invoice.paidAt ?? nowIso() : null;
      const { error } = await getSupabase()
        .from("invoices")
        .update({ status, paid_at: paidAt, updated_at: nowIso() })
        .eq("id", invoice.id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await getSupabase().from("invoices").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

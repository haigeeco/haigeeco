"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { InvoiceForm } from "@/components/InvoiceForm";
import { Card, LinkButton, PageHeader } from "@/components/ui";
import { useClients } from "@/lib/db/clients";
import { useProducts } from "@/lib/db/products";
import { useSettings } from "@/lib/db/settings";
import { useInvoice } from "@/lib/db/invoices";

function EditInvoiceInner() {
  const params = useSearchParams();
  const id = params.get("id") ?? "";
  const settingsQuery = useSettings();
  const clientsQuery = useClients();
  const productsQuery = useProducts();
  const invoiceQuery = useInvoice(id);

  const loading =
    settingsQuery.isLoading ||
    clientsQuery.isLoading ||
    productsQuery.isLoading ||
    invoiceQuery.isLoading;

  if (loading) {
    return <Card className="p-6 text-sm text-slate-400">Memuat data…</Card>;
  }
  if (settingsQuery.isError || invoiceQuery.isError) {
    return <Card className="p-6 text-sm text-rose-600">Gagal memuat data. Coba muat ulang.</Card>;
  }

  const invoice = invoiceQuery.data ?? undefined;
  const settings = settingsQuery.data;

  if (!invoice || !settings) {
    return (
      <Card className="p-6">
        <p className="text-sm text-slate-600">Invoice tidak ditemukan.</p>
        <div className="mt-4">
          <LinkButton href="/admin/invoices" variant="secondary">
            Kembali ke daftar
          </LinkButton>
        </div>
      </Card>
    );
  }

  return (
    <InvoiceForm
      settings={settings}
      clients={clientsQuery.data ?? []}
      products={productsQuery.data ?? []}
      invoice={invoice}
      nextNumber={invoice.number}
    />
  );
}

export default function EditInvoicePage() {
  return (
    <div>
      <PageHeader title="Edit Invoice" description="Perbarui detail invoice." />
      <Suspense fallback={<Card className="p-6 text-sm text-slate-400">Memuat…</Card>}>
        <EditInvoiceInner />
      </Suspense>
    </div>
  );
}

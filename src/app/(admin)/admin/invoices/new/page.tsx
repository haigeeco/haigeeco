"use client";

import { InvoiceForm } from "@/components/InvoiceForm";
import { Card, PageHeader } from "@/components/ui";
import { useClients } from "@/lib/db/clients";
import { useProducts } from "@/lib/db/products";
import { useSettings } from "@/lib/db/settings";
import { useNextInvoiceNumber } from "@/lib/db/invoices";

export default function NewInvoicePage() {
  const settingsQuery = useSettings();
  const clientsQuery = useClients();
  const productsQuery = useProducts();
  const numberQuery = useNextInvoiceNumber(settingsQuery.data?.invoicePrefix);

  const loading = settingsQuery.isLoading || clientsQuery.isLoading || productsQuery.isLoading;
  const error = settingsQuery.isError || clientsQuery.isError || productsQuery.isError;
  const settings = settingsQuery.data;

  return (
    <div>
      <PageHeader title="Buat Invoice" description="Isi detail invoice baru untuk klien." />
      {loading ? (
        <Card className="p-6 text-sm text-slate-400">Memuat data…</Card>
      ) : error || !settings ? (
        <Card className="p-6 text-sm text-rose-600">
          Gagal memuat data. Coba muat ulang halaman.
        </Card>
      ) : (
        <InvoiceForm
          settings={settings}
          clients={clientsQuery.data ?? []}
          products={productsQuery.data ?? []}
          nextNumber={numberQuery.data ?? ""}
        />
      )}
    </div>
  );
}

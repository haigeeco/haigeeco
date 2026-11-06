"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { InvoiceDocument } from "@/components/InvoiceDocument";
import { Button } from "@/components/ui";
import { useInvoice } from "@/lib/db/invoices";
import { useSettings } from "@/lib/db/settings";
import { defaultSettings } from "@/lib/domain";

function PrintInvoiceInner() {
  const params = useSearchParams();
  const id = params.get("id") ?? "";
  const invoiceQuery = useInvoice(id);
  const settingsQuery = useSettings();
  const invoice = invoiceQuery.data ?? null;

  useEffect(() => {
    if (!invoice) return;
    const timer = window.setTimeout(() => window.print(), 400);
    return () => window.clearTimeout(timer);
  }, [invoice]);

  if (invoiceQuery.isLoading) {
    return <div className="p-8 text-sm text-slate-400">Memuat…</div>;
  }
  if (!invoice) {
    return <div className="p-8 text-sm text-slate-600">Invoice tidak ditemukan.</div>;
  }

  const settings = settingsQuery.data ?? defaultSettings();

  return (
    <div className="print-area min-h-screen bg-slate-100 p-3 sm:p-8">
      <div className="no-print mx-auto mb-4 flex max-w-3xl flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-slate-500">
          Jika dialog cetak tidak muncul otomatis, klik tombol di samping. Pilih “Save as PDF”.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="primary" onClick={() => window.print()}>
            Cetak / Simpan PDF
          </Button>
          <Button variant="secondary" onClick={() => window.close()}>
            Tutup
          </Button>
        </div>
      </div>
      <div className="print-sheet mx-auto max-w-3xl rounded-xl border border-slate-200 bg-white shadow-sm">
        <InvoiceDocument invoice={invoice} settings={settings} />
      </div>
    </div>
  );
}

export default function PrintInvoicePage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-slate-400">Memuat…</div>}>
      <PrintInvoiceInner />
    </Suspense>
  );
}

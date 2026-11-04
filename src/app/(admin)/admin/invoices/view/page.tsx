"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { InvoiceDocument } from "@/components/InvoiceDocument";
import { StatusBadge } from "@/components/StatusBadge";
import { Button, Card, LinkButton, buttonClass } from "@/components/ui";
import type { CompanySettings, Invoice, InvoiceStatus } from "@/lib/types";
import { useInvoices, useSetInvoiceStatus, useDeleteInvoice } from "@/lib/db/invoices";
import { useSettings } from "@/lib/db/settings";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { defaultSettings } from "@/lib/domain";

function InvoiceActions({ invoice, settings }: { invoice: Invoice; settings: CompanySettings }) {
  const router = useRouter();
  const setStatus = useSetInvoiceStatus();
  const deleteInvoice = useDeleteInvoice();
  const whatsappUrl = buildWhatsAppUrl(invoice, settings);

  async function handleDelete() {
    if (
      !window.confirm(`Hapus invoice ${invoice.number}? Tindakan ini tidak bisa dibatalkan.`)
    ) {
      return;
    }
    try {
      await deleteInvoice.mutateAsync(invoice.id);
      router.push("/admin/invoices");
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Gagal menghapus invoice.");
    }
  }

  function changeStatus(status: InvoiceStatus) {
    setStatus.mutate(
      { invoice, status },
      {
        onError: (err) =>
          window.alert(err instanceof Error ? err.message : "Gagal mengubah status."),
      }
    );
  }

  return (
    <div className="no-print mb-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-mono text-lg font-semibold text-slate-900">{invoice.number}</h1>
            <StatusBadge invoice={invoice} />
          </div>
          <p className="mt-1 text-sm text-slate-500">{invoice.clientSnapshot.name}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <LinkButton href="/admin/invoices" variant="ghost">
            Kembali
          </LinkButton>
          <LinkButton href={`/admin/invoices/edit?id=${invoice.id}`} variant="secondary">
            Edit
          </LinkButton>
          <Link
            href={`/admin/invoices/print?id=${invoice.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClass("secondary")}
          >
            Unduh / Cetak PDF
          </Link>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClass("success")}
          >
            Kirim WhatsApp
          </a>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-200 pt-3">
        {invoice.status !== "paid" ? (
          <Button variant="success" onClick={() => changeStatus("paid")}>
            Tandai Lunas
          </Button>
        ) : null}
        {invoice.status === "draft" ? (
          <Button variant="secondary" onClick={() => changeStatus("sent")}>
            Tandai Terkirim
          </Button>
        ) : null}
        {invoice.status === "sent" ? (
          <Button variant="secondary" onClick={() => changeStatus("draft")}>
            Kembalikan ke Draft
          </Button>
        ) : null}
        {invoice.status !== "cancelled" ? (
          <Button variant="ghost" onClick={() => changeStatus("cancelled")}>
            Batalkan
          </Button>
        ) : null}
        <Button variant="danger" onClick={handleDelete}>
          Hapus
        </Button>
      </div>
    </div>
  );
}

function ViewInvoiceInner() {
  const params = useSearchParams();
  const id = params.get("id") ?? "";
  const invoicesQuery = useInvoices();
  const settingsQuery = useSettings();

  if (invoicesQuery.isLoading) {
    return <Card className="p-6 text-sm text-slate-400">Memuat data…</Card>;
  }
  if (invoicesQuery.isError) {
    return <Card className="p-6 text-sm text-rose-600">Gagal memuat data.</Card>;
  }

  const invoice = (invoicesQuery.data ?? []).find((item) => item.id === id);
  if (!invoice) {
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

  const settings = settingsQuery.data ?? defaultSettings();

  return (
    <div>
      <InvoiceActions invoice={invoice} settings={settings} />
      <Card className="overflow-hidden">
        <InvoiceDocument invoice={invoice} settings={settings} />
      </Card>
    </div>
  );
}

export default function ViewInvoicePage() {
  return (
    <Suspense fallback={<Card className="p-6 text-sm text-slate-400">Memuat…</Card>}>
      <ViewInvoiceInner />
    </Suspense>
  );
}

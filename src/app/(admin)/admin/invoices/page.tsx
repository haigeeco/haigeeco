"use client";

import { useMemo, useState } from "react";
import { displayStatus, type DisplayStatus } from "@/lib/calc";
import { useInvoices } from "@/lib/db/invoices";
import { Card, EmptyState, Input, LinkButton, PageHeader, cn } from "@/components/ui";
import { InvoiceTable } from "@/components/InvoiceTable";

const FILTERS: { value: "all" | DisplayStatus; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Terkirim" },
  { value: "overdue", label: "Jatuh Tempo" },
  { value: "paid", label: "Lunas" },
  { value: "cancelled", label: "Batal" },
];

export default function InvoicesPage() {
  const invoicesQuery = useInvoices();
  const [filter, setFilter] = useState<"all" | DisplayStatus>("all");
  const [query, setQuery] = useState("");

  const invoices = useMemo(() => invoicesQuery.data ?? [], [invoicesQuery.data]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return invoices.filter((invoice) => {
      if (filter !== "all" && displayStatus(invoice) !== filter) return false;
      if (!term) return true;
      return (
        invoice.number.toLowerCase().includes(term) ||
        invoice.clientSnapshot.name.toLowerCase().includes(term)
      );
    });
  }, [invoices, filter, query]);

  return (
    <div>
      <PageHeader
        title="Invoice"
        description="Semua invoice yang pernah dibuat."
        actions={<LinkButton href="/admin/invoices/new">+ Buat Invoice</LinkButton>}
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((option) => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium transition",
                filter === option.value
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Cari nomor / klien…"
          className="sm:max-w-xs"
        />
      </div>

      {invoicesQuery.isLoading ? (
        <Card className="p-6 text-sm text-slate-400">Memuat data…</Card>
      ) : invoicesQuery.isError ? (
        <Card className="p-6 text-sm text-rose-600">Gagal memuat data. Coba muat ulang halaman.</Card>
      ) : filtered.length === 0 ? (
        <EmptyState
          title={invoices.length === 0 ? "Belum ada invoice" : "Tidak ada invoice yang cocok"}
          description={
            invoices.length === 0
              ? "Buat invoice pertama Anda untuk mulai menagih klien."
              : "Coba ubah filter atau kata kunci pencarian."
          }
          action={
            invoices.length === 0 ? (
              <LinkButton href="/admin/invoices/new">+ Buat Invoice</LinkButton>
            ) : null
          }
        />
      ) : (
        <Card>
          <InvoiceTable invoices={filtered} />
        </Card>
      )}
    </div>
  );
}

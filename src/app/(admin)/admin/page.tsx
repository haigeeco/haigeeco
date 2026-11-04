"use client";

import { computeTotals, displayStatus } from "@/lib/calc";
import { formatIDR } from "@/lib/format";
import { Card, EmptyState, LinkButton, PageHeader } from "@/components/ui";
import { InvoiceTable } from "@/components/InvoiceTable";
import { useInvoices } from "@/lib/db/invoices";
import { useClients } from "@/lib/db/clients";

function StatCard({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <Card className="p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-2 text-xl font-bold ${tone ?? "text-slate-900"}`}>{value}</p>
    </Card>
  );
}

export default function DashboardPage() {
  const invoicesQuery = useInvoices();
  const clientsQuery = useClients();

  const invoices = invoicesQuery.data ?? [];
  const clients = clientsQuery.data ?? [];
  const unpaid = invoices.filter((invoice) => invoice.status === "sent");
  const overdue = unpaid.filter((invoice) => displayStatus(invoice) === "overdue");
  const outstanding = unpaid.reduce(
    (sum, invoice) => sum + Math.max(0, computeTotals(invoice).amountDue),
    0
  );
  const paidTotal = invoices
    .filter((invoice) => invoice.status === "paid")
    .reduce((sum, invoice) => sum + computeTotals(invoice).total, 0);

  const recent = invoices.slice(0, 5);
  const loading = invoicesQuery.isLoading || clientsQuery.isLoading;
  const error = invoicesQuery.isError || clientsQuery.isError;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Ringkasan tagihan dan invoice Gee Co."
        actions={<LinkButton href="/admin/invoices/new">+ Buat Invoice</LinkButton>}
      />

      {error ? (
        <Card className="mb-4 p-4 text-sm text-rose-600">
          Gagal memuat data dari server. Periksa koneksi lalu muat ulang.
        </Card>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Belum Dibayar" value={formatIDR(outstanding)} tone="text-indigo-700" />
        <StatCard
          label="Jatuh Tempo"
          value={`${overdue.length} invoice`}
          tone={overdue.length > 0 ? "text-rose-600" : "text-slate-900"}
        />
        <StatCard label="Total Lunas" value={formatIDR(paidTotal)} tone="text-emerald-700" />
        <StatCard label="Klien" value={`${clients.length} klien`} />
      </div>

      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800">Invoice Terbaru</h2>
          {invoices.length > 0 ? (
            <LinkButton href="/admin/invoices" variant="ghost">
              Lihat semua
            </LinkButton>
          ) : null}
        </div>

        {loading ? (
          <Card className="p-6 text-sm text-slate-400">Memuat data…</Card>
        ) : invoices.length === 0 ? (
          <EmptyState
            title="Belum ada invoice"
            description="Mulai dengan menambahkan klien dan produk, lalu buat invoice pertama Anda."
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <LinkButton href="/admin/clients" variant="secondary">
                  Tambah Klien
                </LinkButton>
                <LinkButton href="/admin/invoices/new">+ Buat Invoice</LinkButton>
              </div>
            }
          />
        ) : (
          <Card>
            <InvoiceTable invoices={recent} />
          </Card>
        )}
      </div>
    </div>
  );
}

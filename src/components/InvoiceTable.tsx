"use client";

import Link from "next/link";
import type { Invoice } from "@/lib/types";
import { computeTotals } from "@/lib/calc";
import { formatDate, formatIDR } from "@/lib/format";
import { ResponsiveTable } from "./ResponsiveTable";
import { StatusBadge } from "./StatusBadge";

export function InvoiceTable({ invoices }: { invoices: Invoice[] }) {
  return (
    <ResponsiveTable
      items={invoices}
      getKey={(invoice) => invoice.id}
      head={
        <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
          <th className="px-4 py-3 font-semibold">Nomor</th>
          <th className="px-4 py-3 font-semibold">Klien</th>
          <th className="px-4 py-3 font-semibold">Tanggal</th>
          <th className="px-4 py-3 font-semibold">Jatuh Tempo</th>
          <th className="px-4 py-3 text-right font-semibold">Total</th>
          <th className="px-4 py-3 font-semibold">Status</th>
        </tr>
      }
      renderCard={(invoice) => {
        const totals = computeTotals(invoice);
        return (
          <>
            <div className="flex items-start justify-between gap-3">
              <Link
                href={`/admin/invoices/view?id=${invoice.id}`}
                className="font-mono text-xs font-medium text-indigo-600 hover:underline"
              >
                {invoice.number}
              </Link>
              <StatusBadge invoice={invoice} />
            </div>
            <p className="mt-1 truncate text-sm font-medium text-slate-800">
              {invoice.clientSnapshot.name}
            </p>
            <div className="mt-2 flex items-end justify-between gap-3">
              <p className="text-xs text-slate-500">
                {formatDate(invoice.issueDate)} · JT {formatDate(invoice.dueDate)}
              </p>
              <p className="shrink-0 text-sm font-semibold tabular-nums text-slate-900">
                {formatIDR(totals.total)}
              </p>
            </div>
          </>
        );
      }}
      renderRow={(invoice) => {
        const totals = computeTotals(invoice);
        return (
          <tr key={invoice.id} className="border-b border-slate-100 hover:bg-slate-50">
            <td className="px-4 py-3">
              <Link
                href={`/admin/invoices/view?id=${invoice.id}`}
                className="font-mono text-xs font-medium text-indigo-600 hover:underline"
              >
                {invoice.number}
              </Link>
            </td>
            <td className="px-4 py-3 text-slate-700">{invoice.clientSnapshot.name}</td>
            <td className="px-4 py-3 text-slate-500">{formatDate(invoice.issueDate)}</td>
            <td className="px-4 py-3 text-slate-500">{formatDate(invoice.dueDate)}</td>
            <td className="px-4 py-3 text-right font-medium tabular-nums text-slate-800">
              {formatIDR(totals.total)}
            </td>
            <td className="px-4 py-3">
              <StatusBadge invoice={invoice} />
            </td>
          </tr>
        );
      }}
    />
  );
}

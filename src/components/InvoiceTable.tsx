"use client";

import Link from "next/link";
import type { Invoice } from "@/lib/types";
import { computeTotals } from "@/lib/calc";
import { formatDate, formatIDR } from "@/lib/format";
import { StatusBadge } from "./StatusBadge";

export function InvoiceTable({ invoices }: { invoices: Invoice[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[680px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
            <th className="px-4 py-3 font-semibold">Nomor</th>
            <th className="px-4 py-3 font-semibold">Klien</th>
            <th className="px-4 py-3 font-semibold">Tanggal</th>
            <th className="px-4 py-3 font-semibold">Jatuh Tempo</th>
            <th className="px-4 py-3 text-right font-semibold">Total</th>
            <th className="px-4 py-3 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => {
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
          })}
        </tbody>
      </table>
    </div>
  );
}

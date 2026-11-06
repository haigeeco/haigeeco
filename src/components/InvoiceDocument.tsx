import type { CompanySettings, Invoice } from "@/lib/types";
import { computeTotals, lineDiscountValue, lineTotal } from "@/lib/calc";
import { formatDateLong, formatIDR, formatNumber } from "@/lib/format";
import { DEFAULT_LOGO_URL } from "@/lib/domain";

export function InvoiceDocument({
  invoice,
  settings,
}: {
  invoice: Invoice;
  settings: CompanySettings;
}) {
  const totals = computeTotals(invoice);
  const client = invoice.clientSnapshot;

  return (
    <div className="invoice-doc mx-auto w-full max-w-3xl break-words bg-white px-5 py-6 text-slate-800 sm:p-10">
      <div className="doc-block flex flex-col justify-between gap-6 sm:flex-row">
        <div className="flex items-start gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={settings.logoUrl || DEFAULT_LOGO_URL}
            alt={settings.name || "Logo"}
            className="h-14 w-14 object-contain"
          />
          <div>
            <p className="text-lg font-bold text-slate-900">{settings.name || "Gee Co."}</p>
            {settings.tagline ? (
              <p className="text-xs text-slate-500">{settings.tagline}</p>
            ) : null}
            <div className="mt-2 space-y-0.5 text-xs text-slate-600">
              {settings.address ? <p>{settings.address}</p> : null}
              {settings.city ? <p>{settings.city}</p> : null}
              {settings.phone ? <p>Telp/WA: {settings.phone}</p> : null}
              {settings.email ? <p>{settings.email}</p> : null}
              {settings.npwp ? <p>NPWP: {settings.npwp}</p> : null}
            </div>
          </div>
        </div>

        <div className="text-left sm:text-right">
          <p className="text-2xl font-bold uppercase tracking-wide text-slate-900">Invoice</p>
          <p className="mt-1 font-mono text-sm text-slate-700">{invoice.number}</p>
          <div className="mt-3 space-y-0.5 text-xs text-slate-600">
            <p>
              Tanggal: <span className="font-medium text-slate-800">{formatDateLong(invoice.issueDate)}</span>
            </p>
            <p>
              Jatuh Tempo:{" "}
              <span className="font-medium text-slate-800">{formatDateLong(invoice.dueDate)}</span>
            </p>
            {invoice.deliveryDate ? (
              <p>
                Tanggal Kirim:{" "}
                <span className="font-medium text-slate-800">{formatDateLong(invoice.deliveryDate)}</span>
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-200 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Ditagihkan kepada
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-900">{client.name}</p>
          <div className="mt-1 space-y-0.5 text-xs text-slate-600">
            {client.contactPerson ? <p>UP: {client.contactPerson}</p> : null}
            {client.address ? <p>{client.address}</p> : null}
            {client.city ? <p>{client.city}</p> : null}
            {client.phone ? <p>{client.phone}</p> : null}
            {client.email ? <p>{client.email}</p> : null}
            {client.npwp ? <p>NPWP: {client.npwp}</p> : null}
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Pembayaran
          </p>
          <div className="mt-1 space-y-0.5 text-xs text-slate-600">
            <p>
              Bank: <span className="font-medium text-slate-800">{settings.bankName || "-"}</span>
            </p>
            <p>
              No. Rekening:{" "}
              <span className="font-medium text-slate-800">
                {settings.bankAccountNumber || "-"}
              </span>
            </p>
            <p>
              Atas Nama:{" "}
              <span className="font-medium text-slate-800">{settings.bankAccountName || "-"}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="invoice-items-table mt-8 hidden sm:block">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b-2 border-slate-300 text-left text-[11px] uppercase tracking-wide text-slate-500">
              <th className="py-2 pr-2 font-semibold">Deskripsi</th>
              <th className="py-2 px-2 text-right font-semibold">Qty</th>
              <th className="py-2 px-2 text-left font-semibold">Satuan</th>
              <th className="py-2 px-2 text-right font-semibold">Harga</th>
              <th className="py-2 px-2 text-right font-semibold">Diskon</th>
              <th className="py-2 pl-2 text-right font-semibold">Jumlah</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item) => (
              <tr key={item.id} className="border-b border-slate-100 align-top">
                <td className="py-2 pr-2 text-slate-800">{item.description}</td>
                <td className="py-2 px-2 text-right tabular-nums text-slate-700">
                  {formatNumber(item.quantity)}
                </td>
                <td className="py-2 px-2 text-slate-600">{item.unit}</td>
                <td className="py-2 px-2 text-right tabular-nums text-slate-700">
                  {formatIDR(item.unitPrice)}
                </td>
                <td className="py-2 px-2 text-right tabular-nums text-slate-600">
                  {item.discountPercent > 0
                    ? `${formatNumber(item.discountPercent)}% (-${formatIDR(lineDiscountValue(item))})`
                    : "-"}
                </td>
                <td className="py-2 pl-2 text-right font-medium tabular-nums text-slate-900">
                  {formatIDR(lineTotal(item))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="invoice-items-mobile mt-6 space-y-3 sm:hidden">
        {invoice.items.map((item) => (
          <li key={item.id} className="doc-block rounded-lg border border-slate-200 p-3">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium text-slate-800">{item.description}</p>
              <p className="shrink-0 text-sm font-semibold tabular-nums text-slate-900">
                {formatIDR(lineTotal(item))}
              </p>
            </div>
            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-slate-600">
              <span className="tabular-nums">
                {formatNumber(item.quantity)} {item.unit} × {formatIDR(item.unitPrice)}
              </span>
              {item.discountPercent > 0 ? (
                <span className="tabular-nums text-slate-500">
                  Diskon {formatNumber(item.discountPercent)}% (-{formatIDR(lineDiscountValue(item))})
                </span>
              ) : null}
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-5 flex flex-col gap-6 sm:flex-row sm:justify-between">
        <div className="max-w-xs text-xs text-slate-500">
          {invoice.notes ? (
            <>
              <p className="font-semibold text-slate-600">Catatan</p>
              <p className="mt-1 whitespace-pre-line">{invoice.notes}</p>
            </>
          ) : null}
          {settings.terms ? (
            <>
              <p className="mt-3 font-semibold text-slate-600">Syarat & Ketentuan</p>
              <p className="mt-1 whitespace-pre-line">{settings.terms}</p>
            </>
          ) : null}
        </div>

        <div className="totals-block ml-auto w-full max-w-xs space-y-1.5 text-sm">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span className="tabular-nums text-slate-800">{formatIDR(totals.subtotal)}</span>
          </div>
          {totals.discount > 0 ? (
            <div className="flex justify-between text-slate-600">
              <span>Diskon</span>
              <span className="tabular-nums text-rose-600">- {formatIDR(totals.discount)}</span>
            </div>
          ) : null}
          {totals.shipping > 0 ? (
            <div className="flex justify-between text-slate-600">
              <span>Ongkos Kirim</span>
              <span className="tabular-nums text-slate-800">{formatIDR(totals.shipping)}</span>
            </div>
          ) : null}
          {invoice.taxEnabled ? (
            <div className="flex justify-between text-slate-600">
              <span>
                {invoice.taxLabel} ({formatNumber(invoice.taxRate)}%)
              </span>
              <span className="tabular-nums text-slate-800">{formatIDR(totals.taxAmount)}</span>
            </div>
          ) : null}
          <div className="flex justify-between border-t-2 border-slate-300 pt-2 text-base font-bold text-slate-900">
            <span>Total</span>
            <span className="tabular-nums">{formatIDR(totals.total)}</span>
          </div>
          {totals.downPayment > 0 ? (
            <>
              <div className="flex justify-between text-slate-600">
                <span>Uang Muka</span>
                <span className="tabular-nums text-slate-800">- {formatIDR(totals.downPayment)}</span>
              </div>
              <div className="flex justify-between rounded-md bg-slate-100 px-2 py-1.5 font-semibold text-slate-900">
                <span>Sisa Tagihan</span>
                <span className="tabular-nums">{formatIDR(totals.amountDue)}</span>
              </div>
            </>
          ) : null}
        </div>
      </div>

      <p className="mt-10 border-t border-slate-100 pt-4 text-center text-[11px] text-slate-400">
        {settings.name || "Gee Co."}
        {settings.website ? ` — ${settings.website}` : ""} — Terima kasih atas kepercayaan Anda.
      </p>
    </div>
  );
}

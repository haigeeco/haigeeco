import type { Invoice, InvoiceItem, InvoiceStatus } from "./types";
import { todayISO } from "./format";

export interface InvoiceTotals {
  subtotal: number;
  lineDiscount: number;
  discount: number;
  shipping: number;
  netBeforeTax: number;
  taxAmount: number;
  total: number;
  downPayment: number;
  amountDue: number;
}

// Rupiah tidak punya pecahan: bulatkan di titik perhitungan, bukan hanya saat render,
// supaya baris + subtotal + pajak selalu sama dengan yang tercetak.
const rupiah = (value: number): number => Math.round(value);

function lineGross(item: InvoiceItem): number {
  return (item.quantity || 0) * (item.unitPrice || 0);
}

export function lineDiscountValue(item: InvoiceItem): number {
  return rupiah(lineGross(item) * ((item.discountPercent || 0) / 100));
}

export function lineTotal(item: InvoiceItem): number {
  return rupiah(lineGross(item) - lineDiscountValue(item));
}

export function computeTotals(
  invoice: Pick<
    Invoice,
    "items" | "discount" | "shippingCost" | "taxEnabled" | "taxRate" | "downPayment"
  >
): InvoiceTotals {
  const items = invoice.items ?? [];
  const subtotal = rupiah(items.reduce((sum, item) => sum + lineTotal(item), 0));
  const lineDiscount = rupiah(items.reduce((sum, item) => sum + lineDiscountValue(item), 0));
  const discount = rupiah(invoice.discount || 0);
  const shipping = rupiah(invoice.shippingCost || 0);
  const netBeforeTax = rupiah(subtotal - discount + shipping);
  const taxAmount = invoice.taxEnabled ? rupiah(netBeforeTax * ((invoice.taxRate || 0) / 100)) : 0;
  const total = rupiah(netBeforeTax + taxAmount);
  const downPayment = rupiah(invoice.downPayment || 0);

  return {
    subtotal,
    lineDiscount,
    discount,
    shipping,
    netBeforeTax,
    taxAmount,
    total,
    downPayment,
    amountDue: rupiah(total - downPayment),
  };
}

export type DisplayStatus = InvoiceStatus | "overdue";

export function displayStatus(invoice: Invoice): DisplayStatus {
  if (invoice.status === "sent" && invoice.dueDate && invoice.dueDate < todayISO()) {
    return "overdue";
  }
  return invoice.status;
}

export const STATUS_LABEL: Record<DisplayStatus, string> = {
  draft: "Draft",
  sent: "Terkirim",
  paid: "Lunas",
  cancelled: "Batal",
  overdue: "Jatuh Tempo",
};

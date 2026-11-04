import type { CompanySettings, Invoice } from "./types";
import { computeTotals } from "./calc";
import { formatDate, formatIDR, normalizePhone } from "./format";

export function buildInvoiceMessage(invoice: Invoice, settings: CompanySettings): string {
  const totals = computeTotals(invoice);
  const lines: string[] = [];

  lines.push(
    `Halo${invoice.clientSnapshot.contactPerson ? ` ${invoice.clientSnapshot.contactPerson}` : ""},`
  );
  lines.push("");
  lines.push(`Berikut invoice *${invoice.number}* dari ${settings.name || "Gee Co."}.`);
  lines.push(`Total: *${formatIDR(totals.total)}*`);
  if (totals.downPayment > 0) {
    lines.push(`Sisa tagihan: *${formatIDR(totals.amountDue)}*`);
  }
  if (invoice.dueDate) {
    lines.push(`Jatuh tempo: ${formatDate(invoice.dueDate)}`);
  }
  if (settings.bankName || settings.bankAccountNumber) {
    lines.push("");
    lines.push("Pembayaran ke:");
    lines.push(
      `${settings.bankName} ${settings.bankAccountNumber}`.trim()
    );
    if (settings.bankAccountName) lines.push(`a.n. ${settings.bankAccountName}`);
  }
  lines.push("");
  lines.push("Terima kasih.");

  return lines.join("\n");
}

export function buildWhatsAppUrl(invoice: Invoice, settings: CompanySettings): string {
  const phone = normalizePhone(invoice.clientSnapshot.phone);
  const text = encodeURIComponent(buildInvoiceMessage(invoice, settings));
  return phone ? `https://wa.me/${phone}?text=${text}` : `https://wa.me/?text=${text}`;
}

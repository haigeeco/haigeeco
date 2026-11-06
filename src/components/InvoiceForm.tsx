"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type {
  Client,
  CompanySettings,
  Invoice,
  InvoiceItem,
  InvoiceStatus,
  Product,
} from "@/lib/types";
import { computeTotals, lineTotal } from "@/lib/calc";
import { formatIDR, parseNumber, todayISO, addDaysISO } from "@/lib/format";
import { uid, nowIso } from "@/lib/ids";
import { snapshotClient } from "@/lib/domain";
import { useCreateInvoice, useUpdateInvoice } from "@/lib/db/invoices";
import { useClientPrices } from "@/lib/db/clientPrices";
import { buildPriceIndex, resolveClientPrice } from "@/lib/pricing";
import { Button, Card, Field, Input, Select, Textarea, cn } from "./ui";

function blankItem(): InvoiceItem {
  return {
    id: uid("itm"),
    productId: null,
    description: "",
    unit: "pcs",
    quantity: 1,
    unitPrice: 0,
    discountPercent: 0,
  };
}

const STATUS_OPTIONS: { value: InvoiceStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Terkirim" },
  { value: "paid", label: "Lunas" },
  { value: "cancelled", label: "Batal" },
];

export function InvoiceForm({
  settings,
  clients,
  products,
  invoice,
  nextNumber,
}: {
  settings: CompanySettings;
  clients: Client[];
  products: Product[];
  invoice?: Invoice;
  nextNumber: string;
}) {
  const router = useRouter();
  const createInvoice = useCreateInvoice();
  const updateInvoice = useUpdateInvoice();
  const isEdit = Boolean(invoice);

  const [clientId, setClientId] = useState(invoice?.clientId ?? clients[0]?.id ?? "");
  const [issueDate, setIssueDate] = useState(invoice?.issueDate ?? todayISO());
  const [dueDate, setDueDate] = useState(
    invoice?.dueDate ?? addDaysISO(todayISO(), settings.paymentTermDays)
  );
  const [deliveryDate, setDeliveryDate] = useState(invoice?.deliveryDate ?? "");
  const [items, setItems] = useState<InvoiceItem[]>(
    invoice?.items?.length ? invoice.items : [blankItem()]
  );
  const [discount, setDiscount] = useState(invoice?.discount ?? 0);
  const [shippingCost, setShippingCost] = useState(invoice?.shippingCost ?? 0);
  const [taxEnabled, setTaxEnabled] = useState(
    invoice?.taxEnabled ?? settings.taxEnabledByDefault
  );
  const [taxLabel, setTaxLabel] = useState(invoice?.taxLabel ?? settings.taxLabel);
  const [taxRate, setTaxRate] = useState(invoice?.taxRate ?? settings.taxRate);
  const [downPayment, setDownPayment] = useState(invoice?.downPayment ?? 0);
  const [notes, setNotes] = useState(invoice?.notes ?? settings.defaultNotes);
  const [status, setStatus] = useState<InvoiceStatus>(invoice?.status ?? "draft");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const activeProducts = useMemo(
    () => products.filter((product) => product.active),
    [products]
  );

  const pricesQuery = useClientPrices();
  const priceIndex = useMemo(
    () => buildPriceIndex(pricesQuery.data ?? []),
    [pricesQuery.data]
  );
  const priceDate = issueDate || todayISO();

  function clientPriceFor(productId: string, client = clientId): number | null {
    return resolveClientPrice(priceIndex, client, productId, priceDate);
  }

  const totals = computeTotals({
    items,
    discount,
    shippingCost,
    taxEnabled,
    taxRate,
    downPayment,
  });

  function updateItem(id: string, patch: Partial<InvoiceItem>) {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, ...patch } : item))
    );
  }

  function handleProductChange(id: string, productId: string) {
    if (!productId) {
      updateItem(id, { productId: null });
      return;
    }
    const product = products.find((item) => item.id === productId);
    if (!product) return;
    updateItem(id, {
      productId: product.id,
      description: product.description ? `${product.name} — ${product.description}` : product.name,
      unit: product.unit,
      unitPrice: clientPriceFor(product.id) ?? product.price,
    });
  }

  function handleClientChange(nextClientId: string) {
    setClientId(nextClientId);
    setItems((current) =>
      current.map((item) => {
        if (!item.productId) return item;
        const product = products.find((entry) => entry.id === item.productId);
        if (!product) return item;
        return {
          ...item,
          unitPrice: clientPriceFor(item.productId, nextClientId) ?? product.price,
        };
      })
    );
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    const client = clients.find((item) => item.id === clientId);
    const clientSnapshot = client ? snapshotClient(client) : invoice?.clientSnapshot ?? null;

    if (!clientSnapshot) {
      setError("Pilih klien terlebih dahulu. Tambahkan klien di menu Klien.");
      return;
    }
    const validItems = items.filter((item) => item.description.trim() !== "");
    if (validItems.length === 0) {
      setError("Minimal satu item dengan deskripsi harus diisi.");
      return;
    }
    if (!issueDate) {
      setError("Tanggal invoice wajib diisi.");
      return;
    }
    if (discount < 0 || shippingCost < 0 || downPayment < 0) {
      setError("Diskon, ongkos kirim, dan uang muka tidak boleh negatif.");
      return;
    }
    if (discount > totals.subtotal) {
      setError("Diskon invoice tidak boleh melebihi subtotal.");
      return;
    }
    if (downPayment > totals.total) {
      setError("Uang muka tidak boleh melebihi total tagihan.");
      return;
    }
    const badItem = validItems.find(
      (item) =>
        item.quantity < 0 ||
        item.unitPrice < 0 ||
        item.discountPercent < 0 ||
        item.discountPercent > 100
    );
    if (badItem) {
      setError("Periksa item: kuantitas/harga tidak boleh negatif dan diskon 0–100%.");
      return;
    }

    const draft = {
      clientId,
      clientSnapshot,
      issueDate,
      dueDate,
      deliveryDate,
      items: validItems,
      discount,
      shippingCost,
      taxEnabled,
      taxLabel,
      taxRate,
      downPayment,
      notes,
      status,
    };

    setBusy(true);
    try {
      if (invoice) {
        await updateInvoice.mutateAsync({
          ...invoice,
          ...draft,
          paidAt: status === "paid" ? invoice.paidAt ?? nowIso() : null,
        });
        router.push(`/admin/invoices/view?id=${invoice.id}`);
      } else {
        const created = await createInvoice.mutateAsync({
          draft,
          prefix: settings.invoicePrefix,
        });
        router.push(`/admin/invoices/view?id=${created.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan invoice. Coba lagi.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {clients.length === 0 ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Belum ada klien. Tambahkan klien dulu di menu{" "}
          <a href="/admin/clients" className="font-semibold underline">
            Klien
          </a>{" "}
          agar bisa menyimpan invoice.
        </div>
      ) : null}

      <Card className="p-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Klien" className="sm:col-span-2">
            <Select value={clientId} onChange={(event) => handleClientChange(event.target.value)}>
              <option value="">— Pilih klien —</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                  {client.city ? ` — ${client.city}` : ""}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Nomor Invoice">
            <Input
              value={invoice ? invoice.number : nextNumber || "…"}
              readOnly
              className="bg-slate-50 font-mono text-slate-600"
            />
            {!invoice ? (
              <span className="mt-1 block text-[11px] text-slate-400">
                Perkiraan nomor — nomor pasti dibuat otomatis saat disimpan.
              </span>
            ) : null}
          </Field>
          <Field label="Status">
            <Select
              value={status}
              onChange={(event) => setStatus(event.target.value as InvoiceStatus)}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Tanggal Invoice">
            <Input
              type="date"
              value={issueDate}
              onChange={(event) => setIssueDate(event.target.value)}
            />
          </Field>
          <Field label="Jatuh Tempo">
            <Input
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
            />
          </Field>
          <Field label="Tanggal Kirim" hint="Opsional">
            <Input
              type="date"
              value={deliveryDate}
              onChange={(event) => setDeliveryDate(event.target.value)}
            />
          </Field>
        </div>
      </Card>

      <Card className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800">Item</h2>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setItems((c) => [...c, blankItem()])}
          >
            + Tambah Item
          </Button>
        </div>
        <p className="mb-3 text-[11px] text-slate-400">
          Harga terisi otomatis sesuai harga khusus klien (ditandai •); bila tidak ada, memakai harga
          dasar produk. Tetap bisa diubah manual.
        </p>

        <div className="space-y-3">
          {items.map((item, index) => {
            const total = lineTotal(item);
            return (
              <div key={item.id} className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">Item #{index + 1}</span>
                  {items.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => setItems((c) => c.filter((row) => row.id !== item.id))}
                      className="text-xs font-medium text-rose-600 hover:text-rose-700"
                    >
                      Hapus
                    </button>
                  ) : null}
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <Field label="Produk (opsional)">
                    <Select
                      value={item.productId ?? ""}
                      onChange={(event) => handleProductChange(item.id, event.target.value)}
                    >
                      <option value="">— Input manual —</option>
                      {activeProducts.map((product) => {
                        const custom = clientPriceFor(product.id);
                        const shown = custom ?? product.price;
                        return (
                          <option key={product.id} value={product.id}>
                            {product.name} ({formatIDR(shown)}/{product.unit})
                            {custom !== null ? " •" : ""}
                          </option>
                        );
                      })}
                    </Select>
                  </Field>
                  <Field label="Deskripsi">
                    <Input
                      value={item.description}
                      onChange={(event) =>
                        updateItem(item.id, { description: event.target.value })
                      }
                      placeholder="Nama produk / keterangan"
                    />
                  </Field>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-6">
                  <Field label="Qty">
                    <Input
                      type="number"
                      min={0}
                      step="any"
                      value={item.quantity}
                      onChange={(event) =>
                        updateItem(item.id, { quantity: Number(event.target.value) })
                      }
                    />
                  </Field>
                  <Field label="Satuan">
                    <Input
                      value={item.unit}
                      onChange={(event) => updateItem(item.id, { unit: event.target.value })}
                    />
                  </Field>
                  <Field label="Harga Satuan" className="col-span-2">
                    <Input
                      type="number"
                      min={0}
                      step="any"
                      value={item.unitPrice}
                      onChange={(event) =>
                        updateItem(item.id, { unitPrice: Number(event.target.value) })
                      }
                    />
                  </Field>
                  <Field label="Diskon %">
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      step="any"
                      value={item.discountPercent}
                      onChange={(event) =>
                        updateItem(item.id, { discountPercent: Number(event.target.value) })
                      }
                    />
                  </Field>
                  <div className="flex flex-col justify-end">
                    <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Jumlah
                    </span>
                    <span className="truncate px-1 py-2 text-right text-sm font-semibold text-slate-800">
                      {formatIDR(total)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="p-5 lg:col-span-3">
          <h2 className="mb-3 text-sm font-semibold text-slate-800">Pajak & Biaya</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Diskon Invoice (Rp)">
              <Input
                type="number"
                min={0}
                step="any"
                value={discount}
                onChange={(event) => setDiscount(parseNumber(event.target.value))}
              />
            </Field>
            <Field label="Ongkos Kirim (Rp)">
              <Input
                type="number"
                min={0}
                step="any"
                value={shippingCost}
                onChange={(event) => setShippingCost(parseNumber(event.target.value))}
              />
            </Field>
            <Field label="Uang Muka / DP (Rp)">
              <Input
                type="number"
                min={0}
                step="any"
                value={downPayment}
                onChange={(event) => setDownPayment(parseNumber(event.target.value))}
              />
            </Field>
            <div className="flex items-end">
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={taxEnabled}
                  onChange={(event) => setTaxEnabled(event.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-200"
                />
                Kenakan pajak
              </label>
            </div>
            {taxEnabled ? (
              <>
                <Field label="Label Pajak">
                  <Input value={taxLabel} onChange={(event) => setTaxLabel(event.target.value)} />
                </Field>
                <Field label="Tarif Pajak (%)">
                  <Input
                    type="number"
                    min={0}
                    step="any"
                    value={taxRate}
                    onChange={(event) => setTaxRate(parseNumber(event.target.value))}
                  />
                </Field>
              </>
            ) : null}
          </div>
          <Field label="Catatan" className="mt-4">
            <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} />
          </Field>
        </Card>

        <Card className="h-fit p-5 lg:col-span-2">
          <h2 className="mb-3 text-sm font-semibold text-slate-800">Ringkasan</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between text-slate-600">
              <dt>Subtotal</dt>
              <dd className="font-medium text-slate-800">{formatIDR(totals.subtotal)}</dd>
            </div>
            {totals.discount > 0 ? (
              <div className="flex justify-between text-slate-600">
                <dt>Diskon</dt>
                <dd className="font-medium text-rose-600">- {formatIDR(totals.discount)}</dd>
              </div>
            ) : null}
            {totals.shipping > 0 ? (
              <div className="flex justify-between text-slate-600">
                <dt>Ongkos Kirim</dt>
                <dd className="font-medium text-slate-800">{formatIDR(totals.shipping)}</dd>
              </div>
            ) : null}
            {taxEnabled ? (
              <div className="flex justify-between text-slate-600">
                <dt>
                  {taxLabel} ({taxRate}%)
                </dt>
                <dd className="font-medium text-slate-800">{formatIDR(totals.taxAmount)}</dd>
              </div>
            ) : null}
            <div className="flex justify-between border-t border-slate-200 pt-2 text-base">
              <dt className="font-semibold text-slate-900">Total</dt>
              <dd className="font-bold text-slate-900">{formatIDR(totals.total)}</dd>
            </div>
            {totals.downPayment > 0 ? (
              <>
                <div className="flex justify-between text-slate-600">
                  <dt>Uang Muka</dt>
                  <dd className="font-medium text-slate-800">- {formatIDR(totals.downPayment)}</dd>
                </div>
                <div className="flex justify-between rounded-lg bg-indigo-50 px-3 py-2">
                  <dt className="font-semibold text-indigo-800">Sisa Tagihan</dt>
                  <dd className="font-bold text-indigo-800">{formatIDR(totals.amountDue)}</dd>
                </div>
              </>
            ) : null}
          </dl>
        </Card>
      </div>

      {error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <div className={cn("flex flex-wrap items-center justify-end gap-2")}>
        <Button type="button" variant="secondary" onClick={() => router.back()} disabled={busy}>
          Batal
        </Button>
        <Button type="submit" variant="primary" disabled={busy}>
          {busy ? "Menyimpan…" : isEdit ? "Simpan Perubahan" : "Simpan Invoice"}
        </Button>
      </div>
    </form>
  );
}

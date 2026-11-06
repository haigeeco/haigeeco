"use client";

import { useMemo, useState } from "react";
import type { Client, ClientPrice } from "@/lib/types";
import { formatDate, formatIDR, parseNumber, todayISO } from "@/lib/format";
import { newId, nowIso } from "@/lib/ids";
import { buildPriceIndex, priceHistory, resolveClientPrice } from "@/lib/pricing";
import { useProducts } from "@/lib/db/products";
import { useClientPrices, useDeleteClientPrice, useSaveClientPrice } from "@/lib/db/clientPrices";
import { Button, Field, Input, Modal } from "./ui";
import { useFeedback } from "./feedback";

interface Draft {
  price: string;
  date: string;
}

export function ClientPriceModal({ client, onClose }: { client: Client; onClose: () => void }) {
  const productsQuery = useProducts();
  const pricesQuery = useClientPrices();
  const savePrice = useSaveClientPrice();
  const deletePrice = useDeleteClientPrice();
  const { confirm } = useFeedback();

  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [error, setError] = useState("");

  const prices = pricesQuery.data ?? [];
  const index = useMemo(() => buildPriceIndex(pricesQuery.data ?? []), [pricesQuery.data]);
  const products = (productsQuery.data ?? []).filter((product) => product.active);
  const loading = productsQuery.isLoading || pricesQuery.isLoading;

  function draftFor(productId: string): Draft {
    return drafts[productId] ?? { price: "", date: todayISO() };
  }

  function setDraft(productId: string, patch: Partial<Draft>) {
    setDrafts((current) => ({
      ...current,
      [productId]: { ...draftFor(productId), ...patch },
    }));
  }

  async function save(productId: string) {
    const draft = draftFor(productId);
    if (!draft.price.trim()) {
      setError("Isi harga terlebih dahulu.");
      return;
    }
    const value = parseNumber(draft.price);
    if (!Number.isFinite(value) || value <= 0) {
      setError("Harga harus berupa angka lebih dari 0.");
      return;
    }
    const date = draft.date || todayISO();
    const existing = prices.find(
      (entry) =>
        entry.clientId === client.id &&
        entry.productId === productId &&
        entry.effectiveFrom === date
    );
    const stamp = nowIso();
    setError("");
    try {
      await savePrice.mutateAsync({
        id: existing?.id ?? newId(),
        clientId: client.id,
        productId,
        price: value,
        effectiveFrom: date,
        createdAt: existing?.createdAt ?? stamp,
        updatedAt: stamp,
      });
      setDrafts((current) => ({ ...current, [productId]: { price: "", date } }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan harga.");
    }
  }

  async function remove(entry: ClientPrice) {
    const ok = await confirm({
      title: "Hapus Harga",
      message: `Hapus harga ${formatIDR(entry.price)} (berlaku ${formatDate(entry.effectiveFrom)})?`,
      confirmLabel: "Hapus",
      destructive: true,
    });
    if (!ok) return;
    setError("");
    try {
      await deletePrice.mutateAsync(entry.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus harga.");
    }
  }

  return (
    <Modal
      open
      title={`Harga Khusus — ${client.name}`}
      onClose={onClose}
      footer={
        <Button variant="secondary" onClick={onClose}>
          Tutup
        </Button>
      }
    >
      <p className="mb-3 text-xs leading-relaxed text-slate-500">
        Harga di sini dipakai otomatis saat membuat invoice untuk klien ini. Isi <strong>tanggal
        berlaku</strong> untuk menyiapkan kenaikan harga (mis. mulai 1 Desember). Invoice lama tidak
        ikut berubah.
      </p>

      {error ? (
        <p className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="py-6 text-sm text-slate-400">Memuat…</p>
      ) : products.length === 0 ? (
        <p className="py-6 text-sm text-slate-500">Belum ada produk aktif. Tambahkan produk dulu.</p>
      ) : (
        <ul className="max-h-[55vh] space-y-3 overflow-y-auto pr-1">
          {products.map((product) => {
            const current = resolveClientPrice(index, client.id, product.id, todayISO());
            const history = priceHistory(index, client.id, product.id);
            const draft = draftFor(product.id);
            return (
              <li key={product.id} className="rounded-lg border border-slate-200 p-3">
                <p className="text-sm font-medium text-slate-800">{product.name}</p>
                <p className="text-xs text-slate-500">
                  {current !== null ? (
                    <>
                      Harga klien:{" "}
                      <span className="font-semibold text-slate-700">{formatIDR(current)}</span>
                    </>
                  ) : (
                    <>Pakai harga dasar: {formatIDR(product.price)}</>
                  )}
                  <span className="text-slate-400"> /{product.unit}</span>
                </p>

                <div className="mt-2 flex flex-wrap items-end gap-2">
                  <Field label="Harga" className="w-full sm:w-32">
                    <Input
                      type="number"
                      min={0}
                      step="any"
                      value={draft.price}
                      onChange={(event) => setDraft(product.id, { price: event.target.value })}
                      placeholder={String(current ?? product.price)}
                    />
                  </Field>
                  <Field label="Berlaku mulai" className="w-full sm:w-44">
                    <Input
                      type="date"
                      value={draft.date}
                      onChange={(event) => setDraft(product.id, { date: event.target.value })}
                    />
                  </Field>
                  <Button
                    type="button"
                    onClick={() => save(product.id)}
                    disabled={savePrice.isPending}
                    className="w-full sm:w-auto"
                  >
                    Simpan
                  </Button>
                </div>

                {history.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {history.map((entry) => (
                      <span
                        key={entry.id}
                        className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600"
                      >
                        {formatDate(entry.effectiveFrom)} · {formatIDR(entry.price)}
                        <button
                          type="button"
                          onClick={() => remove(entry)}
                          className="text-slate-400 transition hover:text-rose-600"
                          aria-label="Hapus harga"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </Modal>
  );
}

"use client";

import { useState } from "react";
import type { Product } from "@/lib/types";
import { newId, nowIso } from "@/lib/ids";
import { useProducts, useUpsertProduct, useDeleteProduct } from "@/lib/db/products";
import { formatIDR } from "@/lib/format";
import {
  Button,
  Card,
  EmptyState,
  Field,
  Input,
  Modal,
  PageHeader,
  Textarea,
} from "@/components/ui";

function blankProduct(): Product {
  const stamp = nowIso();
  return {
    id: newId(),
    sku: "",
    name: "",
    description: "",
    unit: "box",
    price: 0,
    active: true,
    createdAt: stamp,
    updatedAt: stamp,
  };
}

export default function ProductsPage() {
  const productsQuery = useProducts();
  const upsertProduct = useUpsertProduct();
  const deleteProduct = useDeleteProduct();
  const products = productsQuery.data ?? [];

  const [editing, setEditing] = useState<Product | null>(null);
  const [error, setError] = useState("");

  const isNew = editing ? !products.some((product) => product.id === editing.id) : false;

  function openNew() {
    setError("");
    setEditing(blankProduct());
  }

  function openEdit(product: Product) {
    setError("");
    setEditing({ ...product });
  }

  function close() {
    setEditing(null);
    setError("");
  }

  async function save() {
    if (!editing) return;
    if (!editing.name.trim()) {
      setError("Nama produk wajib diisi.");
      return;
    }
    try {
      await upsertProduct.mutateAsync({ ...editing, name: editing.name.trim() });
      close();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan produk.");
    }
  }

  async function remove(product: Product) {
    if (!window.confirm(`Hapus produk "${product.name}"? Invoice lama tetap tersimpan.`)) return;
    try {
      await deleteProduct.mutateAsync(product.id);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Gagal menghapus produk.");
    }
  }

  return (
    <div>
      <PageHeader
        title="Produk"
        description="Katalog dessert dan harga jual."
        actions={<Button onClick={openNew}>+ Tambah Produk</Button>}
      />

      {productsQuery.isLoading ? (
        <Card className="p-6 text-sm text-slate-400">Memuat data…</Card>
      ) : productsQuery.isError ? (
        <Card className="p-6 text-sm text-rose-600">Gagal memuat data. Coba muat ulang halaman.</Card>
      ) : products.length === 0 ? (
        <EmptyState
          title="Belum ada produk"
          description="Tambahkan produk agar bisa dipilih saat membuat invoice."
          action={<Button onClick={openNew}>+ Tambah Produk</Button>}
        />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3 font-semibold">Nama</th>
                  <th className="px-4 py-3 font-semibold">SKU</th>
                  <th className="px-4 py-3 font-semibold">Satuan</th>
                  <th className="px-4 py-3 text-right font-semibold">Harga</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800">{product.name}</p>
                      {product.description ? (
                        <p className="text-xs text-slate-500">{product.description}</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">
                      {product.sku || "-"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{product.unit}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-slate-800">
                      {formatIDR(product.price)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          product.active
                            ? "inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700"
                            : "inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500"
                        }
                      >
                        {product.active ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" onClick={() => openEdit(product)}>
                          Edit
                        </Button>
                        <Button variant="ghost" onClick={() => remove(product)}>
                          Hapus
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal
        open={editing !== null}
        title={isNew ? "Tambah Produk" : "Edit Produk"}
        onClose={close}
        footer={
          <>
            <Button variant="secondary" onClick={close}>
              Batal
            </Button>
            <Button onClick={save} disabled={upsertProduct.isPending}>
              {upsertProduct.isPending ? "Menyimpan…" : "Simpan"}
            </Button>
          </>
        }
      >
        {editing ? (
          <div className="space-y-3">
            <Field label="Nama Produk">
              <Input
                value={editing.name}
                onChange={(event) => setEditing({ ...editing, name: event.target.value })}
                placeholder="Contoh: Basque Burnt Cheesecake"
              />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="SKU">
                <Input
                  value={editing.sku}
                  onChange={(event) => setEditing({ ...editing, sku: event.target.value })}
                />
              </Field>
              <Field label="Satuan">
                <Input
                  value={editing.unit}
                  onChange={(event) => setEditing({ ...editing, unit: event.target.value })}
                  placeholder="box / pcs / cup"
                />
              </Field>
              <Field label="Harga Jual (Rp)">
                <Input
                  type="number"
                  min={0}
                  step="any"
                  value={editing.price}
                  onChange={(event) =>
                    setEditing({ ...editing, price: Number(event.target.value) })
                  }
                />
              </Field>
              <div className="flex items-end">
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={editing.active}
                    onChange={(event) =>
                      setEditing({ ...editing, active: event.target.checked })
                    }
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-200"
                  />
                  Produk aktif
                </label>
              </div>
            </div>
            <Field label="Deskripsi">
              <Textarea
                value={editing.description}
                onChange={(event) =>
                  setEditing({ ...editing, description: event.target.value })
                }
                placeholder="Contoh: Box isi 6 potong"
              />
            </Field>
            {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

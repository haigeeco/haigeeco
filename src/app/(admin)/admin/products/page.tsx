"use client";

import { useState, type ChangeEvent } from "react";
import type { Product } from "@/lib/types";
import { newId, nowIso } from "@/lib/ids";
import { useProducts, useUpsertProduct, useDeleteProduct } from "@/lib/db/products";
import { uploadPublicAsset } from "@/lib/db/storage";
import { ResponsiveTable } from "@/components/ResponsiveTable";
import { useFeedback } from "@/components/feedback";
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
    category: "",
    unit: "box",
    price: 0,
    customerPrice: 0,
    imageUrl: "",
    websiteVisible: true,
    sortOrder: 0,
    active: true,
    createdAt: stamp,
    updatedAt: stamp,
  };
}

function thumb(product: Product) {
  if (product.imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={product.imageUrl}
        alt=""
        className="h-12 w-12 shrink-0 rounded-xl border border-line object-cover"
      />
    );
  }
  return (
    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-dashed border-line bg-cream-deep text-[11px] text-ink-soft">
      —
    </span>
  );
}

export default function ProductsPage() {
  const productsQuery = useProducts();
  const upsertProduct = useUpsertProduct();
  const deleteProduct = useDeleteProduct();
  const { confirm, notify } = useFeedback();
  const products = productsQuery.data ?? [];

  const [editing, setEditing] = useState<Product | null>(null);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

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

  async function handleImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !editing) return;
    setError("");
    setUploading(true);
    try {
      const url = await uploadPublicAsset(file, "products");
      setEditing((current) => (current ? { ...current, imageUrl: url } : current));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengunggah foto produk.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  async function save() {
    if (!editing) return;
    if (!editing.name.trim()) {
      setError("Nama produk wajib diisi.");
      return;
    }
    if (editing.price < 0 || editing.customerPrice < 0) {
      setError("Harga tidak boleh negatif.");
      return;
    }
    try {
      await upsertProduct.mutateAsync({
        ...editing,
        name: editing.name.trim(),
        category: editing.category.trim(),
      });
      close();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan produk.");
    }
  }

  async function remove(product: Product) {
    const ok = await confirm({
      title: "Hapus Produk",
      message: `Hapus produk "${product.name}"? Invoice lama tetap tersimpan.`,
      confirmLabel: "Hapus",
      destructive: true,
    });
    if (!ok) return;
    try {
      await deleteProduct.mutateAsync(product.id);
    } catch (err) {
      notify({
        title: "Gagal menghapus",
        message: err instanceof Error ? err.message : "Gagal menghapus produk.",
      });
    }
  }

  return (
    <div>
      <PageHeader
        title="Produk"
        description="Katalog dessert, foto, harga customer (website), dan harga B2B."
        actions={<Button onClick={openNew}>+ Tambah Produk</Button>}
      />

      {productsQuery.isLoading ? (
        <Card className="p-6 text-sm text-ink-soft">Memuat data…</Card>
      ) : productsQuery.isError ? (
        <Card className="p-6 text-sm text-rose-600">Gagal memuat data. Coba muat ulang halaman.</Card>
      ) : products.length === 0 ? (
        <EmptyState
          title="Belum ada produk"
          description="Tambahkan produk agar bisa dipilih saat membuat invoice dan tampil di situs publik."
          action={<Button onClick={openNew}>+ Tambah Produk</Button>}
        />
      ) : (
        <Card>
          <ResponsiveTable
            items={products}
            getKey={(product) => product.id}
            minWidth="min-w-[900px]"
            head={
              <tr className="border-b border-line text-left text-xs uppercase tracking-wider text-ink-soft">
                <th className="px-4 py-3 font-semibold">Produk</th>
                <th className="px-4 py-3 font-semibold">Kategori</th>
                <th className="px-4 py-3 text-right font-semibold">Harga Customer</th>
                <th className="px-4 py-3 text-right font-semibold">Harga B2B</th>
                <th className="px-4 py-3 font-semibold">Website</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Aksi</th>
              </tr>
            }
            renderCard={(product) => (
              <>
                <div className="flex items-start gap-3">
                  {thumb(product)}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink">{product.name}</p>
                    {product.description ? (
                      <p className="mt-0.5 line-clamp-2 text-xs text-ink-soft">
                        {product.description}
                      </p>
                    ) : null}
                  </div>
                  <span
                    className={
                      product.active
                        ? "shrink-0 inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700"
                        : "shrink-0 inline-flex rounded-full bg-cream-deep px-2.5 py-0.5 text-xs font-medium text-ink-soft"
                    }
                  >
                    {product.active ? "Aktif" : "Nonaktif"}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-ink-soft/70">
                      Customer
                    </p>
                    <p className="font-medium tabular-nums text-ink">
                      {formatIDR(product.customerPrice)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-ink-soft/70">B2B</p>
                    <p className="font-medium tabular-nums text-ink">{formatIDR(product.price)}</p>
                  </div>
                </div>
                <p className="mt-2 text-xs text-ink-soft">
                  {product.websiteVisible ? "Tampil di website" : "Disembunyikan dari website"}
                  {product.category ? ` · ${product.category}` : ""}
                </p>
                <div className="mt-3 flex flex-wrap gap-1">
                  <Button variant="ghost" onClick={() => openEdit(product)}>
                    Edit
                  </Button>
                  <Button variant="ghost" onClick={() => remove(product)}>
                    Hapus
                  </Button>
                </div>
              </>
            )}
            renderRow={(product) => (
              <tr key={product.id} className="border-b border-line hover:bg-cream/60">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {thumb(product)}
                    <div className="min-w-0">
                      <p className="font-medium text-ink">{product.name}</p>
                      {product.description ? (
                        <p className="max-w-xs truncate text-xs text-ink-soft">
                          {product.description}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-ink-soft">{product.category || "-"}</td>
                <td className="px-4 py-3 text-right tabular-nums text-ink">
                  {formatIDR(product.customerPrice)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-ink-soft">
                  {formatIDR(product.price)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={
                      product.websiteVisible
                        ? "inline-flex rounded-full bg-pistachio-soft px-2.5 py-0.5 text-xs font-medium text-pistachio-dark"
                        : "inline-flex rounded-full bg-cream-deep px-2.5 py-0.5 text-xs font-medium text-ink-soft"
                    }
                  >
                    {product.websiteVisible ? "Tampil" : "Tersembunyi"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={
                      product.active
                        ? "inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700"
                        : "inline-flex rounded-full bg-cream-deep px-2.5 py-0.5 text-xs font-medium text-ink-soft"
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
            )}
          />
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
            <Button onClick={save} disabled={upsertProduct.isPending || uploading}>
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
              <Field label="Kategori" hint="Tampil di website, mis. Cake atau Jajanan viral.">
                <Input
                  value={editing.category}
                  onChange={(event) => setEditing({ ...editing, category: event.target.value })}
                  placeholder="Cake / Dessert box / Jajanan viral"
                />
              </Field>
              <Field label="Satuan">
                <Input
                  value={editing.unit}
                  onChange={(event) => setEditing({ ...editing, unit: event.target.value })}
                  placeholder="box / pcs / cup"
                />
              </Field>
              <Field label="Urutan Tampil" hint="Angka kecil tampil lebih dulu di website.">
                <Input
                  type="number"
                  min={0}
                  value={editing.sortOrder}
                  onChange={(event) =>
                    setEditing({ ...editing, sortOrder: Number(event.target.value) })
                  }
                />
              </Field>
            </div>

            <div className="grid gap-3 rounded-xl bg-cream-deep p-3 sm:grid-cols-2">
              <Field
                label="Harga Customer (website)"
                hint="Hanya harga ini yang pernah tampil di situs publik."
              >
                <Input
                  type="number"
                  min={0}
                  step="any"
                  value={editing.customerPrice}
                  onChange={(event) =>
                    setEditing({ ...editing, customerPrice: Number(event.target.value) })
                  }
                />
              </Field>
              <Field
                label="Harga B2B / kolaborasi"
                hint="Dipakai untuk invoice dan harga mitra. Tidak ditampilkan di website."
              >
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
            </div>

            <Field label="Deskripsi" hint="Tampil di website sebagai penjelasan produk.">
              <Textarea
                value={editing.description}
                onChange={(event) =>
                  setEditing({ ...editing, description: event.target.value })
                }
                placeholder="Contoh: Box isi 6 potong, dipanggang hingga permukaan caramelized."
              />
            </Field>

            <Field label="Foto Produk" hint="Disimpan di Storage publik, tampil di website.">
              <div className="flex items-center gap-3">
                {editing.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={editing.imageUrl}
                    alt="Foto produk"
                    className="h-20 w-20 rounded-xl border border-line object-cover"
                  />
                ) : (
                  <span className="flex h-20 w-20 items-center justify-center rounded-xl border border-dashed border-line bg-white text-xs text-ink-soft">
                    Belum ada
                  </span>
                )}
                <div className="flex flex-wrap gap-2">
                  <label className="cursor-pointer rounded-xl border border-line bg-white px-3 py-2 text-sm font-medium text-ink transition hover:bg-cream-deep">
                    {uploading ? "Mengunggah…" : "Pilih foto"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImage}
                      disabled={uploading}
                    />
                  </label>
                  {editing.imageUrl ? (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setEditing({ ...editing, imageUrl: "" })}
                    >
                      Hapus foto
                    </Button>
                  ) : null}
                </div>
              </div>
            </Field>

            <div className="flex flex-wrap gap-4">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={editing.active}
                  onChange={(event) =>
                    setEditing({ ...editing, active: event.target.checked })
                  }
                  className="h-4 w-4 rounded border-line text-pistachio focus:ring-pistachio-soft"
                />
                Produk aktif
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={editing.websiteVisible}
                  onChange={(event) =>
                    setEditing({ ...editing, websiteVisible: event.target.checked })
                  }
                  className="h-4 w-4 rounded border-line text-pistachio focus:ring-pistachio-soft"
                />
                Tampilkan di website
              </label>
            </div>

            {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

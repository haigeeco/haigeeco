"use client";

import { useState } from "react";
import type { Client } from "@/lib/types";
import { newId, nowIso } from "@/lib/ids";
import { useClients, useUpsertClient, useDeleteClient } from "@/lib/db/clients";
import { ClientPriceModal } from "@/components/ClientPriceModal";
import { ResponsiveTable } from "@/components/ResponsiveTable";
import { useFeedback } from "@/components/feedback";
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

function blankClient(): Client {
  const stamp = nowIso();
  return {
    id: newId(),
    name: "",
    contactPerson: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    npwp: "",
    notes: "",
    createdAt: stamp,
    updatedAt: stamp,
  };
}

export default function ClientsPage() {
  const clientsQuery = useClients();
  const upsertClient = useUpsertClient();
  const deleteClient = useDeleteClient();
  const { confirm, notify } = useFeedback();
  const clients = clientsQuery.data ?? [];

  const [editing, setEditing] = useState<Client | null>(null);
  const [priceClient, setPriceClient] = useState<Client | null>(null);
  const [error, setError] = useState("");

  const isNew = editing ? !clients.some((client) => client.id === editing.id) : false;

  function openNew() {
    setError("");
    setEditing(blankClient());
  }

  function openEdit(client: Client) {
    setError("");
    setEditing({ ...client });
  }

  function close() {
    setEditing(null);
    setError("");
  }

  async function save() {
    if (!editing) return;
    if (!editing.name.trim()) {
      setError("Nama klien wajib diisi.");
      return;
    }
    try {
      await upsertClient.mutateAsync({ ...editing, name: editing.name.trim() });
      close();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan klien.");
    }
  }

  async function remove(client: Client) {
    const ok = await confirm({
      title: "Hapus Klien",
      message: `Hapus klien "${client.name}"? Invoice lama tetap tersimpan.`,
      confirmLabel: "Hapus",
      destructive: true,
    });
    if (!ok) return;
    try {
      await deleteClient.mutateAsync(client.id);
    } catch (err) {
      notify({
        title: "Gagal menghapus",
        message: err instanceof Error ? err.message : "Gagal menghapus klien.",
      });
    }
  }

  return (
    <div>
      <PageHeader
        title="Klien"
        description="Data cafe / mitra yang ditagih."
        actions={<Button onClick={openNew}>+ Tambah Klien</Button>}
      />

      {clientsQuery.isLoading ? (
        <Card className="p-6 text-sm text-slate-400">Memuat data…</Card>
      ) : clientsQuery.isError ? (
        <Card className="p-6 text-sm text-rose-600">Gagal memuat data. Coba muat ulang halaman.</Card>
      ) : clients.length === 0 ? (
        <EmptyState
          title="Belum ada klien"
          description="Tambahkan klien agar bisa membuat invoice."
          action={<Button onClick={openNew}>+ Tambah Klien</Button>}
        />
      ) : (
        <Card>
          <ResponsiveTable
            items={clients}
            getKey={(client) => client.id}
            minWidth="min-w-[640px]"
            head={
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3 font-semibold">Nama</th>
                <th className="px-4 py-3 font-semibold">Kontak</th>
                <th className="px-4 py-3 font-semibold">Telepon</th>
                <th className="px-4 py-3 font-semibold">Kota</th>
                <th className="px-4 py-3 text-right font-semibold">Aksi</th>
              </tr>
            }
            renderCard={(client) => (
              <>
                <p className="text-sm font-medium text-slate-800">{client.name}</p>
                <div className="mt-1 space-y-0.5 text-xs text-slate-500">
                  {client.contactPerson ? <p>UP: {client.contactPerson}</p> : null}
                  {client.phone ? <p>{client.phone}</p> : null}
                  {client.city ? <p>{client.city}</p> : null}
                </div>
                <div className="mt-3 flex flex-wrap gap-1">
                  <Button variant="ghost" onClick={() => setPriceClient(client)}>
                    Harga
                  </Button>
                  <Button variant="ghost" onClick={() => openEdit(client)}>
                    Edit
                  </Button>
                  <Button variant="ghost" onClick={() => remove(client)}>
                    Hapus
                  </Button>
                </div>
              </>
            )}
            renderRow={(client) => (
              <tr key={client.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-800">{client.name}</td>
                <td className="px-4 py-3 text-slate-600">{client.contactPerson || "-"}</td>
                <td className="px-4 py-3 text-slate-600">{client.phone || "-"}</td>
                <td className="px-4 py-3 text-slate-600">{client.city || "-"}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" onClick={() => setPriceClient(client)}>
                      Harga
                    </Button>
                    <Button variant="ghost" onClick={() => openEdit(client)}>
                      Edit
                    </Button>
                    <Button variant="ghost" onClick={() => remove(client)}>
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
        title={isNew ? "Tambah Klien" : "Edit Klien"}
        onClose={close}
        footer={
          <>
            <Button variant="secondary" onClick={close}>
              Batal
            </Button>
            <Button onClick={save} disabled={upsertClient.isPending}>
              {upsertClient.isPending ? "Menyimpan…" : "Simpan"}
            </Button>
          </>
        }
      >
        {editing ? (
          <div className="space-y-3">
            <Field label="Nama Cafe / Klien">
              <Input
                value={editing.name}
                onChange={(event) => setEditing({ ...editing, name: event.target.value })}
                placeholder="Contoh: Kopi Senja"
              />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Nama Kontak">
                <Input
                  value={editing.contactPerson}
                  onChange={(event) =>
                    setEditing({ ...editing, contactPerson: event.target.value })
                  }
                />
              </Field>
              <Field label="Telepon / WhatsApp">
                <Input
                  value={editing.phone}
                  onChange={(event) => setEditing({ ...editing, phone: event.target.value })}
                  placeholder="08xx"
                />
              </Field>
              <Field label="Email">
                <Input
                  type="email"
                  value={editing.email}
                  onChange={(event) => setEditing({ ...editing, email: event.target.value })}
                />
              </Field>
              <Field label="NPWP">
                <Input
                  value={editing.npwp}
                  onChange={(event) => setEditing({ ...editing, npwp: event.target.value })}
                />
              </Field>
            </div>
            <Field label="Alamat Tagih">
              <Input
                value={editing.address}
                onChange={(event) => setEditing({ ...editing, address: event.target.value })}
              />
            </Field>
            <Field label="Kota">
              <Input
                value={editing.city}
                onChange={(event) => setEditing({ ...editing, city: event.target.value })}
              />
            </Field>
            <Field label="Catatan">
              <Textarea
                value={editing.notes}
                onChange={(event) => setEditing({ ...editing, notes: event.target.value })}
              />
            </Field>
            {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          </div>
        ) : null}
      </Modal>

      {priceClient ? (
        <ClientPriceModal client={priceClient} onClose={() => setPriceClient(null)} />
      ) : null}
    </div>
  );
}

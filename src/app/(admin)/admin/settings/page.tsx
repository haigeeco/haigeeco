"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import type { CompanySettings } from "@/lib/types";
import { useSettings, useSaveSettings } from "@/lib/db/settings";
import { useClients } from "@/lib/db/clients";
import { useProducts } from "@/lib/db/products";
import { useInvoices } from "@/lib/db/invoices";
import { useLoadSampleData } from "@/lib/db/sample";
import { uploadPublicAsset } from "@/lib/db/storage";
import { DEFAULT_LOGO_URL } from "@/lib/domain";
import { useFeedback } from "@/components/feedback";
import {
  Button,
  Card,
  Field,
  Input,
  LinkButton,
  PageHeader,
  Textarea,
} from "@/components/ui";

function SectionTitle({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
      {description ? <p className="mt-0.5 text-xs text-slate-500">{description}</p> : null}
    </div>
  );
}

function SettingsForm({ settings }: { settings: CompanySettings }) {
  const saveSettings = useSaveSettings();
  const [form, setForm] = useState<CompanySettings>(settings);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function update(patch: Partial<CompanySettings>) {
    setForm((current) => ({ ...current, ...patch }));
    setSaved(false);
  }

  async function handleLogo(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setError("");
    try {
      const url = await uploadPublicAsset(file, "brand");
      update({ logoUrl: url });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengunggah logo.");
    } finally {
      event.target.value = "";
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSaved(false);
    try {
      await saveSettings.mutateAsync(form);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan pengaturan.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-5">
        <SectionTitle title="Profil Perusahaan" description="Tampil di bagian atas invoice." />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nama Usaha">
            <Input value={form.name} onChange={(e) => update({ name: e.target.value })} />
          </Field>
          <Field label="Tagline">
            <Input value={form.tagline} onChange={(e) => update({ tagline: e.target.value })} />
          </Field>
          <Field label="Alamat" className="sm:col-span-2">
            <Input value={form.address} onChange={(e) => update({ address: e.target.value })} />
          </Field>
          <Field label="Kota">
            <Input value={form.city} onChange={(e) => update({ city: e.target.value })} />
          </Field>
          <Field label="NPWP">
            <Input value={form.npwp} onChange={(e) => update({ npwp: e.target.value })} />
          </Field>
          <Field label="Telepon / WhatsApp">
            <Input value={form.phone} onChange={(e) => update({ phone: e.target.value })} />
          </Field>
          <Field label="Email">
            <Input value={form.email} onChange={(e) => update({ email: e.target.value })} />
          </Field>
          <Field label="Website / Instagram">
            <Input value={form.website} onChange={(e) => update({ website: e.target.value })} />
          </Field>
          <Field label="Logo" hint="Kosongkan untuk memakai logo bawaan aplikasi.">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={form.logoUrl || DEFAULT_LOGO_URL}
                alt="Logo"
                className={
                  form.logoUrl
                    ? "h-12 w-12 rounded-lg border border-slate-200 object-contain"
                    : "h-12 w-12 rounded-lg border border-dashed border-slate-300 object-contain opacity-60"
                }
              />
              <div className="flex flex-wrap gap-2">
                <label className="cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                  Pilih file
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogo} />
                </label>
                {form.logoUrl ? (
                  <Button type="button" variant="ghost" onClick={() => update({ logoUrl: "" })}>
                    Pakai logo bawaan
                  </Button>
                ) : null}
              </div>
            </div>
          </Field>
        </div>
      </Card>

      <Card className="p-5">
        <SectionTitle
          title="Rekening Pembayaran"
          description="Tampil di invoice sebagai instruksi transfer."
        />
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Nama Bank">
            <Input value={form.bankName} onChange={(e) => update({ bankName: e.target.value })} />
          </Field>
          <Field label="Nomor Rekening">
            <Input
              value={form.bankAccountNumber}
              onChange={(e) => update({ bankAccountNumber: e.target.value })}
            />
          </Field>
          <Field label="Atas Nama">
            <Input
              value={form.bankAccountName}
              onChange={(e) => update({ bankAccountName: e.target.value })}
            />
          </Field>
        </div>
      </Card>

      <Card className="p-5">
        <SectionTitle
          title="Situs Publik"
          description="Deploy hook dipicu saat artikel blog pertama kali diterbitkan, agar situs dibangun ulang."
        />
        <Field
          label="Cloudflare Deploy Hook URL"
          hint="Opsional. Cloudflare Pages → Settings → Builds & deployments → Deploy hooks."
        >
          <Input
            value={form.deployHookUrl}
            onChange={(e) => update({ deployHookUrl: e.target.value })}
            placeholder="https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/…"
          />
        </Field>
      </Card>

      <Card className="p-5">
        <SectionTitle title="Default Invoice" description="Nilai awal saat membuat invoice baru." />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Prefix Nomor Invoice" hint="Contoh: GC → GC/2026/0001">
            <Input
              value={form.invoicePrefix}
              onChange={(e) => update({ invoicePrefix: e.target.value })}
            />
          </Field>
          <Field label="Termin Pembayaran (hari)">
            <Input
              type="number"
              min={0}
              value={form.paymentTermDays}
              onChange={(e) => update({ paymentTermDays: Number(e.target.value) })}
            />
          </Field>
          <Field label="Label Pajak">
            <Input value={form.taxLabel} onChange={(e) => update({ taxLabel: e.target.value })} />
          </Field>
          <Field label="Tarif Pajak (%)">
            <Input
              type="number"
              min={0}
              step="any"
              value={form.taxRate}
              onChange={(e) => update({ taxRate: Number(e.target.value) })}
            />
          </Field>
          <div className="flex items-end">
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.taxEnabledByDefault}
                onChange={(e) => update({ taxEnabledByDefault: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-200"
              />
              Aktifkan pajak secara default
            </label>
          </div>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Catatan Default">
            <Textarea
              value={form.defaultNotes}
              onChange={(e) => update({ defaultNotes: e.target.value })}
            />
          </Field>
          <Field label="Syarat & Ketentuan">
            <Textarea value={form.terms} onChange={(e) => update({ terms: e.target.value })} />
          </Field>
        </div>
      </Card>

      <div className="flex items-center justify-end gap-3">
        {error ? <span className="text-sm text-rose-600">{error}</span> : null}
        {saved ? <span className="text-sm text-emerald-600">Tersimpan.</span> : null}
        <Button type="submit" disabled={saveSettings.isPending}>
          {saveSettings.isPending ? "Menyimpan…" : "Simpan Pengaturan"}
        </Button>
      </div>
    </form>
  );
}

function DataSection() {
  const clientsQuery = useClients();
  const productsQuery = useProducts();
  const invoicesQuery = useInvoices();
  const loadSample = useLoadSampleData();
  const { confirm } = useFeedback();
  const [message, setMessage] = useState("");

  const hasData = (clientsQuery.data?.length ?? 0) > 0 || (productsQuery.data?.length ?? 0) > 0;

  async function handleSample() {
    const ok = await confirm({
      title: "Muat Data Contoh",
      message: "Tambahkan data contoh (3 klien + 5 produk)?",
      confirmLabel: "Tambahkan",
    });
    if (!ok) return;
    setMessage("");
    try {
      await loadSample.mutateAsync();
      setMessage("Data contoh ditambahkan.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Gagal menambah data contoh.");
    }
  }

  return (
    <Card className="p-5">
      <SectionTitle
        title="Data & Backup"
        description="Data tersimpan di cloud (Supabase) dan tersinkron lintas perangkat."
      />
      <div className="mb-4 flex flex-wrap gap-2 text-xs text-slate-500">
        <span className="rounded-full bg-slate-100 px-3 py-1">
          {clientsQuery.data?.length ?? 0} klien
        </span>
        <span className="rounded-full bg-slate-100 px-3 py-1">
          {productsQuery.data?.length ?? 0} produk
        </span>
        <span className="rounded-full bg-slate-100 px-3 py-1">
          {invoicesQuery.data?.length ?? 0} invoice
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={handleSample} disabled={hasData || loadSample.isPending}>
          {loadSample.isPending ? "Menambahkan…" : "Muat Data Contoh"}
        </Button>
      </div>
      {message ? <p className="mt-3 text-sm text-slate-600">{message}</p> : null}
      <p className="mt-4 text-xs text-slate-400">
        Backup otomatis dijalankan terjadwal dari sisi server (pg_dump). Data tidak lagi terikat pada
        satu browser.
      </p>
    </Card>
  );
}

export default function SettingsPage() {
  const settingsQuery = useSettings();

  return (
    <div>
      <PageHeader
        title="Pengaturan"
        description="Profil perusahaan, rekening, dan default invoice."
        actions={
          <LinkButton href="/admin/invoices/new" variant="secondary">
            Coba Buat Invoice
          </LinkButton>
        }
      />
      {settingsQuery.isLoading ? (
        <Card className="p-6 text-sm text-slate-400">Memuat data…</Card>
      ) : settingsQuery.isError || !settingsQuery.data ? (
        <Card className="p-6 text-sm text-rose-600">Gagal memuat pengaturan. Coba muat ulang.</Card>
      ) : (
        <div className="space-y-6">
          <SettingsForm settings={settingsQuery.data} />
          <DataSection />
        </div>
      )}
    </div>
  );
}
